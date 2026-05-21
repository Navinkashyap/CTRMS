import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

const OBJECT_ID_FIELDS = [
  "client",
  "service",
  "projectManager",
  "clientContact",
  "sourceLanguage",
];

function sanitizeProjectBody(body) {
  const data = { ...body };
  for (const field of OBJECT_ID_FIELDS) {
    if (data[field] === "" || data[field] == null) {
      delete data[field];
    }
  }
  if (!data.isProgramGroup) {
    data.programName = "";
  }
  return data;
}

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("client", "name")
      .populate("service", "name")
      .populate("clientContact", "firstName lastName email")
      .populate("projectManager", "firstName lastName email")
      .populate("sourceLanguage", "name")
      .populate("targets.targetLanguage", "name")
      .populate("targets.service", "name")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client", "name")
      .populate("service", "name")
      .populate("clientContact", "firstName lastName email")
      .populate("projectManager", "firstName lastName email")
      .populate("sourceLanguage", "name")
      .populate("targets.targetLanguage", "name")
      .populate("targets.service", "name");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post("/", async (req, res) => {
  const project = new Project(sanitizeProjectBody(req.body));
  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update project
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, sanitizeProjectBody(req.body), {
      new: true,
      runValidators: true,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
