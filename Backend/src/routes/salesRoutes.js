// Sales Portal routes — used by the Sales Manager screens under src/Sales in
// the frontend. These read/write the exact same Client, Contact and Project
// collections the main admin app uses (so a client/project created here shows
// up in the admin's own Clients/Projects pages too), but are gated by JWT
// auth + per-account permission flags, unlike the existing /api/clients etc.
import express from "express";
import bcrypt from "bcryptjs";
import Client from "../models/Client.js";
import Contact from "../models/Contact.js";
import Project from "../models/Project.js";
import Admin from "../models/Admin.js";
import VMSProject from "../VMS/models/VMSProject.js";
import Language from "../models/Language.js";
import Tool from "../models/Tool.js";
import Specialization from "../models/Specialization.js";
import Unit from "../models/Unit.js";
import Service from "../models/Service.js";
import {
  buildVmsPayload,
  syncVmsIncoming,
  upload,
  FILE_FIELDS,
  normalizeProjectFiles,
} from "./projectRoutes.js";
import { requireAuth, requireRole, requirePermission } from "../middleware/auth.js";

const router = express.Router();

const sanitizeAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  mobile: admin.mobile,
  dob: admin.dob ? new Date(admin.dob).toISOString().split("T")[0] : "",
  gender: admin.gender,
  role: admin.role,
  status: admin.status,
  permissions: admin.permissions,
  createdAt: admin.createdAt,
});

/* ------------------------------------------------------------------ */
/*  Admin-only: manage Sales Manager accounts                          */
/* ------------------------------------------------------------------ */

router.get("/users", requireAuth, requireRole("superadmin"), async (_req, res, next) => {
  try {
    const users = await Admin.find({ role: "sales_manager" }).sort({ createdAt: -1 });
    res.json(users.map(sanitizeAdmin));
  } catch (error) {
    next(error);
  }
});

router.get("/users/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
  try {
    const user = await Admin.findOne({ _id: req.params.id, role: "sales_manager" });
    if (!user) return res.status(404).json({ message: "Sales Manager not found" });
    res.json(sanitizeAdmin(user));
  } catch (error) {
    next(error);
  }
});

router.post("/users", requireAuth, requireRole("superadmin"), async (req, res, next) => {
  try {
    const { name, email, password, mobile, dob, gender, permissions } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Admin.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      mobile,
      dob: dob || null,
      gender,
      role: "sales_manager",
      permissions,
    });

    res.status(201).json(sanitizeAdmin(user));
  } catch (error) {
    next(error);
  }
});

router.put("/users/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
  try {
    const { name, mobile, dob, gender, status, permissions, password } = req.body;
    const user = await Admin.findOne({ _id: req.params.id, role: "sales_manager" });
    if (!user) return res.status(404).json({ message: "Sales Manager not found" });

    if (name !== undefined) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;
    if (dob !== undefined) user.dob = dob || null;
    if (gender !== undefined) user.gender = gender;
    if (status !== undefined) user.status = status;
    if (permissions !== undefined) {
      user.permissions = { ...user.permissions.toObject(), ...permissions };
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json(sanitizeAdmin(user));
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
  try {
    const user = await Admin.findOneAndDelete({ _id: req.params.id, role: "sales_manager" });
    if (!user) return res.status(404).json({ message: "Sales Manager not found" });
    res.json({ message: "Sales Manager deleted" });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  Clients — Add / View / Edit                                        */
/* ------------------------------------------------------------------ */

router.get("/clients", requireAuth, requirePermission("clients", "view"), async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { membershipCode: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const clients = await Client.find(filter).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

router.get("/clients/:id", requireAuth, requirePermission("clients", "view"), async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (error) {
    next(error);
  }
});

router.post("/clients", requireAuth, requirePermission("clients", "add"), async (req, res, next) => {
  try {
    const client = await Client.create({
      ...req.body,
      createdBy: req.user.name || req.user.email,
    });
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
});

router.put("/clients/:id", requireAuth, requirePermission("clients", "edit"), async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  Client Contacts — Add / View / Edit                                */
/* ------------------------------------------------------------------ */

router.get("/contacts", requireAuth, requirePermission("contacts", "view"), async (req, res, next) => {
  try {
    const { clientId, search } = req.query;
    const filter = {};
    if (clientId) {
      // Contacts added from the admin portal used to store only the client's
      // name in `company` (no clientId), so match those by name as well.
      const client = /^[a-f\d]{24}$/i.test(clientId)
        ? await Client.findById(clientId).select("name").lean()
        : null;
      filter.$and = [{
        $or: [
          { clientId },
          ...(client ? [{ clientId: { $in: [null, ""] }, company: client.name }] : []),
        ],
      }];
    }
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/contacts/:id", requireAuth, requirePermission("contacts", "view"), async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/contacts", requireAuth, requirePermission("contacts", "add"), async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
});

router.put("/contacts/:id", requireAuth, requirePermission("contacts", "edit"), async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  Projects — Create / View                                           */
/* ------------------------------------------------------------------ */

router.get("/projects", requireAuth, requirePermission("projects", "view"), async (req, res, next) => {
  try {
    const { clientId, search } = req.query;
    const filter = {};
    if (clientId) filter.client = clientId;
    if (search) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matchingClients = await Client.find({ name: { $regex: escaped, $options: "i" } }).select("_id");
      filter.$or = [
        { projectName: { $regex: escaped, $options: "i" } },
        { projectId: { $regex: escaped, $options: "i" } },
        { projectCode: { $regex: escaped, $options: "i" } },
        { client: { $in: matchingClients.map((c) => c._id) } },
      ];
    }
    const projects = await Project.find(filter)
      .populate("client", "name membershipCode")
      .populate("clientContact", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get("/projects/:id", requireAuth, requirePermission("projects", "view"), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("client", "name membershipCode")
      .populate("clientContact", "firstName lastName email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.post("/projects", requireAuth, requirePermission("projects", "create"), async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);

    // Same as the admin's own create route: mirror into the VMS "incoming"
    // queue so a PM sees it in My Projects. Best-effort, never fails the request.
    try {
      const payload = await buildVmsPayload(project._id);
      if (payload) {
        await VMSProject.create({ ...payload, status: "Incoming" });
      }
    } catch (mirrorError) {
      console.error("Failed to create VMS incoming project:", mirrorError.message);
    }
  } catch (error) {
    next(error);
  }
});

// Reference / working files for a project the sales manager just created.
router.post(
  "/projects/:id/files",
  requireAuth,
  requirePermission("projects", "create"),
  upload.fields(FILE_FIELDS.map((name) => ({ name, maxCount: 20 }))),
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      for (const field of FILE_FIELDS) {
        const uploaded = req.files?.[field] || [];
        if (!uploaded.length) continue;
        project[field] = [
          ...normalizeProjectFiles(project[field]),
          ...uploaded.map((f) => ({ name: f.originalname, url: `/uploads/${f.filename}` })),
        ];
      }

      await project.save();
      res.json(project);
      await syncVmsIncoming(project._id);
    } catch (error) {
      next(error);
    }
  }
);

/* ------------------------------------------------------------------ */
/*  Masters — read-only lists the Create Project form needs            */
/* ------------------------------------------------------------------ */

const masterList = (Model, sort) => async (_req, res, next) => {
  try {
    res.json(await Model.find().sort(sort));
  } catch (error) {
    next(error);
  }
};

router.get("/masters/languages", requireAuth, masterList(Language, { name: 1 }));
router.get("/masters/tools", requireAuth, masterList(Tool, { name: 1 }));
router.get("/masters/specializations", requireAuth, masterList(Specialization, { name: 1 }));
router.get("/masters/units", requireAuth, masterList(Unit, { name: 1 }));
router.get("/masters/services", requireAuth, masterList(Service, { priority: 1, name: 1 }));

/* ------------------------------------------------------------------ */
/*  Dashboard summary                                                   */
/* ------------------------------------------------------------------ */

router.get("/dashboard/summary", requireAuth, async (_req, res, next) => {
  try {
    const [clients, contacts, projects] = await Promise.all([
      Client.countDocuments(),
      Contact.countDocuments(),
      Project.countDocuments(),
    ]);
    res.json({ clients, contacts, projects });
  } catch (error) {
    next(error);
  }
});

export default router;
