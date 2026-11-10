// Manage super-admin login accounts (the "Add Admin" page). These are real
// login accounts in the Admin collection, so every route requires a logged-in
// superadmin.
import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireRole("superadmin"));

const sanitize = (admin) => ({
  _id: admin._id,
  name: admin.name,
  email: admin.email,
  phone: admin.mobile || "",
  role: admin.role,
  status: admin.status,
  createdAt: admin.createdAt,
});

router.get("/", async (_req, res, next) => {
  try {
    const admins = await Admin.find({ role: "superadmin" }).sort({ createdAt: -1 });
    res.json(admins.map(sanitize));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ _id: req.params.id, role: "superadmin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(sanitize(admin));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const admin = await Admin.create({
      name,
      email,
      mobile: phone,
      password: await bcrypt.hash(password, 10),
      role: "superadmin",
      status: req.body.status === "Inactive" ? "Inactive" : "Active",
    });

    res.status(201).json(sanitize(admin));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ _id: req.params.id, role: "superadmin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (req.body.name !== undefined) admin.name = String(req.body.name).trim();
    if (req.body.email !== undefined) admin.email = String(req.body.email).trim().toLowerCase();
    // Admin.mobile is unique, so a blank value would clash with other blank
    // records — keep the existing number when none is sent.
    if (String(req.body.phone || "").trim()) admin.mobile = String(req.body.phone).trim();
    if (req.body.status === "Active" || req.body.status === "Inactive") {
      if (req.body.status === "Inactive" && String(admin._id) === String(req.user._id)) {
        return res.status(400).json({ message: "You cannot deactivate your own account" });
      }
      admin.status = req.body.status;
    }
    if (req.body.password) {
      if (String(req.body.password).length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      admin.password = await bcrypt.hash(String(req.body.password), 10);
    }

    await admin.save();
    res.json(sanitize(admin));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const admin = await Admin.findOneAndDelete({ _id: req.params.id, role: "superadmin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
