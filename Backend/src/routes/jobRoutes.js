import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import Job from "../models/Job.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sadminperfectras_deliverables",
    resource_type: "auto",
  },
});
const upload = multer({ storage });

// GET /api/jobs?vendorCode=&status=&vendorStatus=&projectId=
router.get("/", async (req, res, next) => {
  try {
    const { vendorCode, status, vendorStatus, projectId } = req.query;
    const filter = {};
    if (vendorCode) filter.vendorCode = vendorCode;
    if (status) filter.status = status;
    if (vendorStatus !== undefined) filter.vendorStatus = vendorStatus;
    if (projectId) filter.projectId = projectId;

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/po/:po
router.get("/po/:po", async (req, res, next) => {
  try {
    const job = await Job.findOne({ po: req.params.po });
    if (!job) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id
router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs — PM creates a purchase order (optionally already assigned to a vendor)
router.post("/", async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.vendorCode && !data.vendorStatus) {
      data.vendorStatus = "Pending";
    }
    const job = await Job.create(data);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

// PUT /api/jobs/:id — PM edits PO details or assigns/reassigns a vendor
router.put("/:id", async (req, res, next) => {
  try {
    const updates = { ...req.body };
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Assigning a vendor to a PO that hasn't been offered yet publishes it as a pending offer.
    if (updates.vendorCode && !job.vendorStatus && !updates.vendorStatus) {
      updates.vendorStatus = "Pending";
      if (!updates.status) updates.status = "Issued";
    }

    Object.assign(job, updates);
    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/jobs/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// PUT /api/jobs/:id/respond — vendor accepts or rejects a pending offer
router.put("/:id/respond", async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "action must be 'accept' or 'reject'" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.vendorStatus !== "Pending") {
      return res.status(409).json({ message: "This offer has already been responded to" });
    }

    if (action === "accept") {
      job.vendorStatus = "In Progress";
      job.startDate = new Date().toISOString().split("T")[0];
    } else {
      job.vendorStatus = "Rejected";
    }
    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs/:id/deliverables — vendor uploads deliverable files
router.post("/:id/deliverables", upload.array("files"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map((file) => ({
        name: file.originalname,
        url: file.path,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      }));
      job.deliveredFiles.push(...newFiles);
      await job.save();
    }

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

// PUT /api/jobs/:id/links — vendor adds a deliverable link
router.put("/:id/links", async (req, res, next) => {
  try {
    const { link } = req.body;
    if (!link || !link.trim()) {
      return res.status(400).json({ message: "link is required" });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $push: { deliveredLinks: link.trim() } },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
});

// PUT /api/jobs/:id/complete — vendor marks the job as completed
router.put("/:id/complete", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.vendorStatus !== "In Progress") {
      return res.status(409).json({ message: "Only jobs in progress can be marked completed" });
    }
    job.vendorStatus = "Completed";
    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
});

export default router;
