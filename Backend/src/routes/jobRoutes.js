import express from "express";
import { createS3Uploader, uploadedFileUrl } from "../utils/s3Upload.js";

import Job from "../models/Job.js";
import VMSProject from "../VMS/models/VMSProject.js";
import { syncAdminProjectStatus } from "../VMS/utils/adminProjectSync.js";

const router = express.Router();

// Best-effort cascade: when a job's vendor-facing status resolves to a
// terminal state, mirror it onto the parent VMSProject (and from there onto
// the admin's own Project) so status isn't stuck at "In Progress" forever
// once the vendor has actually finished. Never throws.
async function cascadeJobStatus(job, vmsStatus) {
  if (!job.project) return;
  try {
    const vmsProject = await VMSProject.findByIdAndUpdate(
      job.project,
      { status: vmsStatus },
      { new: true }
    );
    if (vmsProject) {
      await syncAdminProjectStatus(vmsProject.projectId, vmsStatus);
    }
  } catch (error) {
    console.error("Failed to cascade job status to project:", error.message);
  }
}

// A project keeps one project number but can carry several purchase orders —
// one per vendor/task — so PO numbers have to differ within the same project.
// Callers that don't name one (the PM assigning a vendor from the project Edit
// page) get the next free `<projectNumber>-PO<n>`.
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const poBaseFor = (projectId) =>
  String(projectId || "").split(" / ")[0].trim() || "PO";

async function nextPoNumber(projectId) {
  const base = poBaseFor(projectId);
  const taken = await Job.find({ po: new RegExp(`^${escapeRegExp(base)}-PO\\d+$`) })
    .select("po")
    .lean();
  const highest = taken.reduce((max, job) => {
    const n = parseInt(job.po.slice(base.length + 3), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `${base}-PO${highest + 1}`;
}

const upload = createS3Uploader({ folder: "sadminperfectras_deliverables" });

// POST /api/jobs/uploads — single-file upload for the per-task Working File /
// Reference File pickers on the project Edit page. Runs before a PO exists
// (or before the task is even assigned to a vendor), so it just stores the
// file and hands back {name, url} for the caller to carry on the PO payload.
router.post("/uploads", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "file is required" });
    }
    res.status(201).json({ name: req.file.originalname, url: uploadedFileUrl(req.file) });
  } catch (error) {
    next(error);
  }
});

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

    const autoNumbered = !data.po;
    if (autoNumbered) {
      data.po = await nextPoNumber(data.projectId);
    }

    // Two PMs assigning vendors at the same moment can mint the same number;
    // the unique index catches it, so just take the next one and retry.
    for (let attempt = 0; ; attempt++) {
      try {
        const job = await Job.create(data);
        return res.status(201).json(job);
      } catch (error) {
        if (error.code !== 11000) throw error;
        if (!autoNumbered) {
          return res
            .status(409)
            .json({ message: `Purchase order ${data.po} already exists.` });
        }
        if (attempt >= 4) throw error;
        data.po = await nextPoNumber(data.projectId);
      }
    }
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

    // Republishing/reassigning after a rejection — clear the rejection marker
    // so the PM's UI stops flagging it once it's back in play.
    if (updates.vendorStatus && updates.vendorStatus !== "Rejected") {
      updates.rejectedAt = null;
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
      job.rejectedAt = new Date();
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
        url: uploadedFileUrl(file),
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
    await cascadeJobStatus(job, "Completed");
  } catch (error) {
    next(error);
  }
});

export default router;
