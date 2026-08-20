import express from "express";

import { keyFromUrl, presignedUrl } from "../utils/s3Upload.js";

const router = express.Router();

// Files uploaded before the S3 switch still carry Cloudinary URLs. Those are
// public, so they are redirected through as-is — but only for the exact hosts
// Cloudinary served, never an arbitrary address supplied by the caller.
const LEGACY_FILE_HOSTS = new Set(["res.cloudinary.com"]);

const isLegacyFileUrl = (url) => {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && LEGACY_FILE_HOSTS.has(hostname);
  } catch {
    return false;
  }
};

// GET /api/files/view?url=<stored file url>
//
// Documents live in a private bucket, so the URL stored on a client/job record
// is not fetchable on its own. The frontends link here instead and we hand back
// a short-lived signed URL as a redirect, so <a href> and window.open keep
// working unchanged.
//
// Files uploaded before the S3 switch carry Cloudinary URLs, which are already
// public — those are redirected through untouched (see LEGACY_FILE_HOSTS).
router.get("/view", async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ message: "url is required" });
    }

    const key = keyFromUrl(url);
    if (!key) {
      // Not one of ours. Redirecting to an arbitrary caller-supplied address
      // would turn this endpoint into an open redirect, so only the hosts that
      // actually served our files before the S3 switch are allowed through.
      if (isLegacyFileUrl(url)) return res.redirect(url);
      return res.status(400).json({ message: "Unsupported file url" });
    }

    return res.redirect(await presignedUrl(key));
  } catch (error) {
    return next(error);
  }
});

export default router;
