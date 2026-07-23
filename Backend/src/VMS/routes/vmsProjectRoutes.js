import express from "express";
import VMSProject from "../models/VMSProject.js";

const router = express.Router();

// GET /api/vms/projects
router.get("/", async (req, res, next) => {
  try {
    const projects = await VMSProject.find().sort({ createdAt: -1 });
    res.json(projects);
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
