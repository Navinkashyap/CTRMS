import express from "express";
import VMSProject from "../models/VMSProject.js";
import vmsAuth from "../middleware/vmsAuth.js";

const router = express.Router();
router.use(vmsAuth);

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
