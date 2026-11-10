import express from "express";
import Role from "../models/Role.js";
import RolePermission from "../models/RolePermission.js";

const router = express.Router();

// Roles the panel shipped with as hardcoded data. Inserted once, the first
// time the collection is read while empty, so existing screens keep showing
// the same roles after switching to the API.
const DEFAULT_ROLES = [
  { roleName: "Super Admin", abbreviation: "SA", level: 1 },
  { roleName: "Admin", abbreviation: "AD", level: 2 },
  { roleName: "Accountant", abbreviation: "AC", level: 3 },
  { roleName: "Project Head", abbreviation: "PH", level: 3 },
  { roleName: "Project Manager", abbreviation: "PM", level: 4 },
  { roleName: "Project Executive", abbreviation: "PE", level: 5 },
  { roleName: "Sales Head", abbreviation: "SH", level: 6 },
  { roleName: "Sales Manager", abbreviation: "SM", level: 7 },
  { roleName: "Sales Executive", abbreviation: "SE", level: 8 },
  { roleName: "Vendor Manager", abbreviation: "VM", level: 8 },
  { roleName: "Vendor", abbreviation: "VN", level: 9 },
];

const seedIfEmpty = async () => {
  if ((await Role.estimatedDocumentCount()) > 0) return;
  try {
    await Role.insertMany(DEFAULT_ROLES, { ordered: false });
  } catch (err) {
    // A concurrent request may have seeded first; duplicates are fine.
    if (err?.code !== 11000 && !err?.writeErrors) throw err;
  }
};

const pickRole = (body) => {
  const data = {};
  if (body.roleName !== undefined) data.roleName = String(body.roleName).trim();
  if (body.abbreviation !== undefined) data.abbreviation = String(body.abbreviation).trim().toUpperCase();
  if (body.level !== undefined && body.level !== "") data.level = Number(body.level);
  if (body.status !== undefined) data.status = body.status;
  return data;
};

router.get("/", async (_req, res, next) => {
  try {
    await seedIfEmpty();
    const roles = await Role.find().sort({ level: 1, roleName: 1 });
    res.json(roles);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = pickRole(req.body);
    if (!data.roleName) return res.status(400).json({ message: "Role name is required" });
    const role = await Role.create(data);
    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = await Role.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Role not found" });

    const oldName = existing.roleName;
    Object.assign(existing, pickRole(req.body));
    await existing.save();

    // Permissions are keyed by role name, so carry them over on rename.
    if (oldName !== existing.roleName) {
      await RolePermission.updateOne({ role: oldName }, { role: existing.roleName });
    }

    res.json(existing);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    await RolePermission.deleteOne({ role: role.roleName });
    res.json({ message: "Role deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
