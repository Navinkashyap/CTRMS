import express from "express";
import mongoose from "mongoose";
import { createS3Uploader, uploadedFileUrl } from "../utils/s3Upload.js";

import Job from "../models/Job.js";

const router = express.Router();

// A vendor finishing their PO no longer completes the project: one project now
// carries several tasks/vendors, and the PM closes it explicitly by delivering
// to sales (PMSales → PUT /api/vms/projects/:id {status: "Completed"}), which
// is also what syncs the admin's Project.

const PO_STATUSES = Job.schema.path("status").enumValues;

// The PM review screen sends the label it shows ("Approved"); the vendor
// portal reads the same verdict as "Accepted". Store the one both understand.
const VENDOR_STATUS_ALIASES = { Approved: "Accepted" };
const REVIEW_VERDICTS = ["Accepted", "Rejected", "Changes Requested"];
// Statuses from which the vendor may (re)submit deliverables.
const SUBMITTABLE = ["In Progress", "Rejected", "Changes Requested"];

const hasSubmitted = (job) => Boolean(job.submittedAt) || job.vendorStatus === "Completed";

// PO numbers for a multi-vendor task are `<basePo>-<vendorCode>`.
const deriveBasePo = (po, vendorCode) =>
  vendorCode && po.endsWith(`-${vendorCode}`) ? po.slice(0, -(vendorCode.length + 1)) : po;

// Once one vendor accepts a task, the other pending offers for that same task
// are closed so nobody else starts on it. Best-effort; never throws.
async function cancelSiblingOffers(job) {
  const sameTask = [];
  if (job.taskId) {
    const scope = { taskId: job.taskId };
    if (job.targetId) scope.targetId = job.targetId;
    if (job.project) scope.project = job.project;
    else if (job.projectId) scope.projectId = job.projectId;
    else return;
    sameTask.push(scope);
  }
  if (job.basePo && job.basePo !== job.po) sameTask.push({ basePo: job.basePo });
  if (!sameTask.length) return;

  try {
    await Job.updateMany(
      { _id: { $ne: job._id }, vendorStatus: "Pending", $or: sameTask },
      { vendorStatus: "Cancelled", status: "Cancelled", cancelledAt: new Date() }
    );
  } catch (error) {
    console.error("Failed to cancel competing offers:", error.message);
  }
}

// Shared by PUT /:id and PUT /:id/complete: the vendor hands in their work.
function markSubmitted(job, submittedAt) {
  job.vendorStatus = "Completed";
  job.submittedAt = submittedAt ? new Date(submittedAt) : new Date();
  // A resubmission starts a fresh review.
  job.reviewStatus = "";
  job.reviewedAt = null;
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

// GET /api/jobs?vendorCode=&status=&vendorStatus=&projectId=&projectMongoId=&taskId=&basePo=
router.get("/", async (req, res, next) => {
  try {
    const { vendorCode, status, vendorStatus, projectId, projectMongoId, taskId, basePo } = req.query;
    const filter = {};
    if (vendorCode) filter.vendorCode = vendorCode;
    if (status) filter.status = status;
    if (vendorStatus !== undefined) filter.vendorStatus = vendorStatus;
    if (projectId) filter.projectId = projectId;
    if (projectMongoId !== undefined) {
      // An unknown filter used to be ignored, which returned every job in the
      // system to a caller that asked for one project's.
      if (!mongoose.Types.ObjectId.isValid(projectMongoId)) return res.json([]);
      filter.project = projectMongoId;
    }
    if (taskId) filter.taskId = taskId;
    if (basePo) filter.basePo = basePo;

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

    if (data.status && !PO_STATUSES.includes(data.status)) delete data.status;

    const autoNumbered = !data.po;
    if (autoNumbered) {
      data.po = await nextPoNumber(data.projectId);
    }
    if (!data.basePo) data.basePo = deriveBasePo(data.po, data.vendorCode);

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
        data.basePo = data.po;
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

    if (updates.vendorStatus) {
      updates.vendorStatus = VENDOR_STATUS_ALIASES[updates.vendorStatus] || updates.vendorStatus;
    }
    // Several screens mirror the vendor-facing status into `status` too
    // ("Completed", "Approved", "Rejected"). `status` is the PO's own lifecycle,
    // so anything that isn't a PO status is dropped rather than failing the save.
    if (updates.status && !PO_STATUSES.includes(updates.status)) delete updates.status;

    // Vendor submits their deliverables.
    if (updates.vendorStatus === "Completed" && job.vendorStatus !== "Completed") {
      if (!SUBMITTABLE.includes(job.vendorStatus)) {
        return res.status(409).json({ message: `A job that is "${job.vendorStatus || "not offered"}" can't be submitted` });
      }
      markSubmitted(job, updates.submittedAt);
      delete updates.vendorStatus;
      delete updates.submittedAt;
    }

    // PM's verdict on submitted work.
    if (REVIEW_VERDICTS.includes(updates.vendorStatus) && hasSubmitted(job)) {
      updates.reviewStatus = updates.vendorStatus;
      updates.reviewedAt = new Date();
    }

    if (updates.vendorStatus === "Cancelled" && job.vendorStatus !== "Cancelled") {
      updates.cancelledAt = new Date();
      if (!updates.status) updates.status = "Cancelled";
    }

    // Republishing the offer (to the same or a new vendor) starts it over.
    if (updates.vendorStatus === "Pending" && job.vendorStatus && job.vendorStatus !== "Pending") {
      Object.assign(updates, {
        submittedAt: null,
        reviewStatus: "",
        reviewedAt: null,
        cancelledAt: null,
        pmFeedback: updates.pmFeedback ?? "",
      });
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
    if (action === "accept") await cancelSiblingOffers(job);
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
    // The vendor portal fires this right after its own PUT {vendorStatus:
    // "Completed"}, so an already-submitted job is a no-op, not a conflict.
    if (job.vendorStatus === "Completed") return res.json(job);
    if (!SUBMITTABLE.includes(job.vendorStatus)) {
      return res.status(409).json({ message: "Only jobs in progress or sent back for changes can be submitted" });
    }
    markSubmitted(job);
    await job.save();
    res.json(job);
  } catch (error) {
    next(error);
  }
});

export default router;
