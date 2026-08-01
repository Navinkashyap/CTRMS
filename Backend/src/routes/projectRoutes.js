import express from "express";
import Project from "../models/Project.js";
import Client from "../models/Client.js";
import VMSProject from "../VMS/models/VMSProject.js";

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

  // Sanitize ObjectId / Date fields inside each target and its tasks
  if (Array.isArray(data.targets)) {
    data.targets = data.targets.map((target) => {
      const t = { ...target };
      for (const field of ["sourceLanguage", "targetLanguage", "service"]) {
        if (t[field] === "" || t[field] == null) {
          delete t[field];
        }
      }
      if (Array.isArray(t.tasks)) {
        t.tasks = t.tasks.map((task) => {
          const tk = { ...task };
          for (const field of ["startDate", "endDate"]) {
            if (tk[field] === "" || tk[field] == null) {
              delete tk[field];
            }
          }
          return tk;
        });
      }
      return t;
    });
  }

  return data;
}

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("client", "name currency")
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
      .populate("client", "name currency")
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

    // Mirror into the VMS "incoming" queue so a PM sees this new project
    // in their My Projects list. Best-effort: never block/fail the admin
    // response if this secondary write has an issue.
    try {
      const clientDoc = newProject.client
        ? await Client.findById(newProject.client).select("name").lean()
        : null;
      await VMSProject.create({
        projectId: newProject.projectId,
        name: newProject.projectName,
        client: clientDoc?.name || "",
        deadline: newProject.deadline
          ? newProject.deadline.toISOString().slice(0, 10)
          : "",
        description: newProject.description || "",
        status: "Incoming",
      });
    } catch (mirrorError) {
      console.error("Failed to create VMS incoming project:", mirrorError.message);
    }
  } catch (error) {
    console.error("Create project error:", error.message, error.errors || "");
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
