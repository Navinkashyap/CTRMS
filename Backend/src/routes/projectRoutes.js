import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Project from "../models/Project.js";
import VMSProject from "../VMS/models/VMSProject.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../../uploads");

const router = express.Router();

// Project reference/working file uploads. Served back out at /uploads by server.js.
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB — translation source files run large
});

const FILE_FIELDS = ["referenceFiles", "workingFiles"];

// Files are stored as { name, url }, but older rows hold a bare string (the
// browser's fake path from the previous non-uploading file input). Accept both.
function normalizeProjectFile(file) {
  if (!file) return null;
  if (typeof file === "string") {
    const name = file.split(/[\\/]/).pop().trim();
    return name ? { name, url: "" } : null;
  }
  const name = (file.name || "").trim();
  const url = (file.url || "").trim();
  if (!name && !url) return null;
  return { name: name || url.split("/").pop(), url };
}

const normalizeProjectFiles = (files) =>
  (Array.isArray(files) ? files : []).map(normalizeProjectFile).filter(Boolean);

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

  for (const field of FILE_FIELDS) {
    if (data[field] !== undefined) {
      data[field] = normalizeProjectFiles(data[field]);
    }
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
const toFileRefs = (files) =>
  normalizeProjectFiles(files).map((f, i) => ({
    id: i + 1,
    name: f.name,
    url: f.url || "",
  }));

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

// Push the current state of a project onto the PM's pending copy. Only while it
// is still Incoming — once the PM accepts it the project is theirs and admin
// edits must not clobber it. Best-effort: never fails the caller's request.
async function syncVmsIncoming(projectId) {
  try {
    const payload = await buildVmsPayload(projectId);
    if (!payload) return;
    await VMSProject.findOneAndUpdate(
      { projectId: payload.projectId, status: "Incoming" },
      payload
    );
  } catch (error) {
    console.error("Failed to sync VMS incoming project:", error.message);
  }
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
    // PM's pending copy in sync.
    await syncVmsIncoming(project._id);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload reference / working files. Appends to whatever the project already has.
router.post(
  "/:id/files",
  upload.fields(FILE_FIELDS.map((name) => ({ name, maxCount: 20 }))),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      for (const field of FILE_FIELDS) {
        const uploaded = req.files?.[field] || [];
        if (!uploaded.length) continue;
        project[field] = [
          ...normalizeProjectFiles(project[field]),
          ...uploaded.map((f) => ({
            name: f.originalname,
            url: `/uploads/${f.filename}`,
          })),
        ];
      }

      await project.save();
      res.json(project);
      await syncVmsIncoming(project._id);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Remove a single uploaded file from a project
router.delete("/:id/files/:field/:index", async (req, res) => {
  try {
    const { field, index } = req.params;
    if (!FILE_FIELDS.includes(field)) {
      return res.status(400).json({ message: "Unknown file field" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const files = normalizeProjectFiles(project[field]);
    const i = Number(index);
    if (!Number.isInteger(i) || i < 0 || i >= files.length) {
      return res.status(404).json({ message: "File not found" });
    }

    const [removed] = files.splice(i, 1);
    project[field] = files;
    await project.save();

    // Drop the file from disk too, but only if no other project still points at
    // it. Failing here must not fail the request — the record is already updated.
    if (removed.url?.startsWith("/uploads/")) {
      try {
        const stillUsed = await Project.exists({
          _id: { $ne: project._id },
          $or: FILE_FIELDS.map((f) => ({ [f]: { $elemMatch: { url: removed.url } } })),
        });
        if (!stillUsed) {
          fs.promises
            .unlink(path.join(UPLOAD_DIR, path.basename(removed.url)))
            .catch(() => {});
        }
      } catch (cleanupError) {
        console.error("File cleanup failed:", cleanupError.message);
      }
    }

    res.json(project);
    await syncVmsIncoming(project._id);
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
