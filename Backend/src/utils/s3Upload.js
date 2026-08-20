import path from "path";
import crypto from "crypto";

import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Read lazily: these modules are imported from route files, and reading the
// env at import time would bake in whatever was set before dotenv ran.
const region = () => process.env.AWS_REGION;
const bucket = () => process.env.AWS_S3_BUCKET;

let client;
export const s3Client = () => {
  if (!client) {
    client = new S3Client({
      region: region(),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
};

// busboy hands back the filename as latin-1 bytes, so a UTF-8 name arrives
// mojibaked ("RÃ©sumÃ©"). Re-read those bytes as UTF-8 to recover the original.
const decodeName = (originalname = "") => {
  const utf8 = Buffer.from(originalname, "latin1").toString("utf8");
  return utf8.includes("\uFFFD") ? originalname : utf8;
};

// Content-Disposition is signed by the SDK as UTF-8 but written to the wire by
// Node as latin-1, so a non-ASCII filename makes the two disagree and S3 answers
// SignatureDoesNotMatch. RFC 5987 keeps the header pure ASCII: `filename` holds a
// stripped-down fallback and `filename*` carries the real percent-encoded name.
const contentDisposition = (originalname) => {
  const ascii = originalname.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "");
  return `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(originalname)}`;
};

// Uploaded names reach us straight from the browser, so they can carry path
// separators, spaces and non-ASCII. Keep the extension (the frontend picks its
// file icon from it) and make the stem safe for use inside an S3 key.
const safeStem = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const stem = path
    .basename(originalname, path.extname(originalname))
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${stem || "file"}-${crypto.randomUUID()}${ext}`;
};

// The URL stored on each document. The bucket blocks public access, so this is
// not fetchable on its own — `/api/files/view` signs it on demand (see
// `keyFromUrl`). Keeping the canonical object URL in the database means the
// stored value stays meaningful even if the serving mechanism changes.
const objectUrl = (key) =>
  `https://${bucket()}.s3.${region()}.amazonaws.com/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

// Minimal multer storage engine backed by the AWS SDK.
//
// multer-s3 is not used here: its last release (3.0.1, 2022) drives
// lib-storage's multipart upload in a way that modern SDK builds reject with
// "The request signature we calculated does not match" now that streaming
// checksums are mandatory. Talking to the SDK directly keeps us on the
// supported path and is little more code than configuring the engine was.
class S3Storage {
  constructor({ folder }) {
    this.folder = folder;
  }

  _handleFile(_req, file, cb) {
    const originalname = decodeName(file.originalname);
    file.originalname = originalname;
    const key = `${this.folder}/${safeStem(originalname)}`;
    // Buffer the stream so we can hand the SDK a known ContentLength and stay
    // on a single-part PutObject; uploads here are documents, not media files.
    const chunks = [];
    file.stream.on("data", (chunk) => chunks.push(chunk));
    file.stream.on("error", cb);
    file.stream.on("end", async () => {
      const body = Buffer.concat(chunks);
      try {
        await s3Client().send(
          new PutObjectCommand({
            Bucket: bucket(),
            Key: key,
            Body: body,
            ContentType: file.mimetype,
            ContentLength: body.length,
            // Browsers should render a PDF/image inline rather than force a
            // download, and keep the readable name when the user does save it.
            ContentDisposition: contentDisposition(originalname),
            Metadata: { originalname: encodeURIComponent(originalname) },
          })
        );
        cb(null, { key, location: objectUrl(key), size: body.length });
      } catch (error) {
        cb(error);
      }
    });
  }

  _removeFile(_req, file, cb) {
    s3Client()
      .send(new DeleteObjectCommand({ Bucket: bucket(), Key: file.key }))
      .then(() => cb(null), cb);
  }
}

/**
 * Build a multer instance that streams uploads into `folder/` on S3.
 * `allowedExtensions` (optional, lowercase, with dot) rejects anything else.
 */
export const createS3Uploader = ({ folder, allowedExtensions } = {}) => {
  const fileFilter = allowedExtensions
    ? (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) return cb(null, true);
        const error = new Error(
          `Unsupported file type: ${ext || file.originalname}`
        );
        // Read by the global error handler so a bad upload comes back as a
        // plain 400 instead of a 500 with a stack trace.
        error.status = 400;
        cb(error);
      }
    : undefined;

  return multer({ fileFilter, storage: new S3Storage({ folder }) });
};

// The storage engine exposes the object URL as `file.location`; the previous
// Cloudinary storage used `file.path`. Read through this so both shapes work.
export const uploadedFileUrl = (file) => file?.location || file?.path || "";

// Recover the object key from a stored URL. Returns "" for anything that is not
// an object in our bucket — notably the Cloudinary URLs saved before the switch,
// which must keep resolving through their own host.
export const keyFromUrl = (url = "") => {
  const prefix = `https://${bucket()}.s3.${region()}.amazonaws.com/`;
  if (!url.startsWith(prefix)) return "";
  return decodeURIComponent(url.slice(prefix.length));
};

// Short-lived signed link for a private object. Long enough for the browser to
// follow the redirect and download, short enough that a copied link goes stale.
export const presignedUrl = (key, { expiresIn = 300 } = {}) =>
  getSignedUrl(
    s3Client(),
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
    { expiresIn }
  );

export const deleteS3Object = async (url) => {
  const key = keyFromUrl(url);
  if (!key) return false;
  await s3Client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
  return true;
};

export { objectUrl };
