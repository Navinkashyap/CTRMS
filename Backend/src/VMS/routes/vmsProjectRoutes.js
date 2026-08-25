import express from "express";
import mongoose from "mongoose";
import VMSProject from "../models/VMSProject.js";
import vmsAuth from "../middleware/vmsAuth.js";
import { flagAdminProjectPmStatus, syncAdminProjectStatus } from "../utils/adminProjectSync.js";

const router = express.Router();
router.use(vmsAuth);

// A malformed/undefined :id (e.g. a frontend bug sending "undefined" as a
// literal string) otherwise reaches Mongoose's ObjectId cast and surfaces as
// an unhandled 500 with a stack trace instead of a clear client error.
router.param("id", (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid project id: "${id}"` });
  }
  next();
});

// GET /api/vms/projects — everything except pending incoming requests
router.get("/", async (req, res, next) => {
  try {
    const projects = await VMSProject.find({ status: { $ne: "Incoming" } }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// GET /api/vms/projects/incoming — pending project requests awaiting PM review
router.get("/incoming", async (req, res, next) => {
  try {
    const projects = await VMSProject.find({ status: "Incoming" }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// POST /api/vms/projects/incoming — submit a new incoming project request
router.post("/incoming", async (req, res, next) => {
  try {
    const project = new VMSProject({ ...req.body, status: "Incoming" });
    const saved = await project.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vms/projects/incoming/:id
router.delete("/incoming/:id", async (req, res, next) => {
  try {
    const project = await VMSProject.findOneAndDelete({ _id: req.params.id, status: "Incoming" });
    if (!project) return res.status(404).json({ message: "Incoming project not found" });
    res.json({ message: "Incoming project removed" });
  } catch (error) {
    next(error);
  }
});

// POST /api/vms/projects/incoming/:id/accept — PM accepts an incoming project.
// Moves the incoming copy into the PM's real project list and flags the
// admin's own Project record so the admin dashboard reflects the decision.
router.post("/incoming/:id/accept", async (req, res, next) => {
  try {
    const incoming = await VMSProject.findOne({ _id: req.params.id, status: "Incoming" });
    if (!incoming) return res.status(404).json({ message: "Incoming project not found" });

    const data = { ...incoming.toObject(), ...req.body };
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.__v;
    data.status = data.status && data.status !== "Incoming" ? data.status : "In Progress";

    const accepted = await VMSProject.create(data);
    await VMSProject.deleteOne({ _id: incoming._id });
    await flagAdminProjectPmStatus(incoming.projectId, "Accepted");

    res.status(201).json(accepted);
  } catch (error) {
    next(error);
  }
});

// POST /api/vms/projects/incoming/:id/reject — PM rejects an incoming
// project. Unlike the bare DELETE above, this leaves a trace on the admin's
// own Project record instead of vanishing without a notification.
router.post("/incoming/:id/reject", async (req, res, next) => {
  try {
    const incoming = await VMSProject.findOne({ _id: req.params.id, status: "Incoming" });
    if (!incoming) return res.status(404).json({ message: "Incoming project not found" });

    const { reason = "" } = req.body || {};
    await flagAdminProjectPmStatus(incoming.projectId, "Rejected", reason);
    await VMSProject.deleteOne({ _id: incoming._id });

    res.json({ message: "Incoming project rejected" });
  } catch (error) {
    next(error);
  }
});

// GET /api/vms/projects/:id
router.get("/:id", async (req, res, next) => {
  try {
    const project = await VMSProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// POST /api/vms/projects
router.post("/", async (req, res, next) => {
  try {
    const project = new VMSProject(req.body);
    const saved = await project.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

// PUT /api/vms/projects/:id
router.put("/:id", async (req, res, next) => {
  try {
    const project = await VMSProject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);

    // Keep the admin's own dashboard from freezing at creation-time status —
    // best-effort, mirrors this PM-side status change back by projectId.
    if (req.body.status) {
      await syncAdminProjectStatus(project.projectId, project.status);
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vms/projects/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const project = await VMSProject.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
