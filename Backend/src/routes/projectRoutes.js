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

// The VMS PM portal keeps its own copy of a project (VMSProject) in a flatter
// shape: language pairs carry plain language names rather than ObjectId refs,
// and files are { id, name } objects rather than plain strings. These helpers
// translate a Project into that shape so the PM sees the language pairs and
// files the admin actually entered.
const fileName = (value) =>
  typeof value === "string" ? value.split(/[\\/]/).pop().trim() : "";

const toFileRefs = (files = []) =>
  files
    .map((f, i) => ({ id: i + 1, name: fileName(f) }))
    .filter((f) => f.name);

async function buildVmsPayload(projectId) {
  const project = await Project.findById(projectId)
    .populate("client", "name")
    .populate("sourceLanguage", "name")
    .populate("targets.sourceLanguage", "name")
    .populate("targets.targetLanguage", "name")
    .lean();
  if (!project) return null;

  const targets = (project.targets || []).map((t, i) => ({
    id: i + 1,
    source: t.sourceLanguage?.name || project.sourceLanguage?.name || "",
    target: t.targetLanguage?.name || "",
    tasks: t.tasks || [],
  }));

  const sourceLang = project.sourceLanguage?.name || targets[0]?.source || "";
  const targetLang = targets[0]?.target || "";

  return {
    projectId: project.projectId,
    name: project.projectName,
    client: project.client?.name || "",
    deadline: project.deadline
      ? new Date(project.deadline).toISOString().slice(0, 10)
      : "",
    description: project.description || "",
    sourceLang,
    targetLang,
    lang: sourceLang && targetLang ? `${sourceLang} → ${targetLang}` : "",
    targets,
    referenceFiles: toFileRefs(project.referenceFiles),
    workingFiles: toFileRefs(project.workingFiles),
  };
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
      const payload = await buildVmsPayload(newProject._id);
      if (payload) {
        await VMSProject.create({ ...payload, status: "Incoming" });
      }
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

    // Language pairs and files are usually filled in after creation, so keep the
    // PM's pending copy in sync. Only while it is still Incoming — once the PM
    // accepts it the project becomes theirs and admin edits must not clobber it.
    try {
      const payload = await buildVmsPayload(project._id);
      if (payload) {
        await VMSProject.findOneAndUpdate(
          { projectId: project.projectId, status: "Incoming" },
          payload
        );
      }
    } catch (mirrorError) {
      console.error("Failed to sync VMS incoming project:", mirrorError.message);
    }
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
