import express from "express";
import RolePermission from "../models/RolePermission.js";

const router = express.Router();

// GET -> [{ role, actions: [...], menus: [...] }, ...]
router.get("/", async (_req, res, next) => {
  try {
    const rows = await RolePermission.find().sort({ role: 1 });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Body: { permissions: { "<role name>": ["<name>", ...], ... } }
// Replaces the given field for every role listed in the body.
const saveField = (field) => async (req, res, next) => {
  try {
    const permissions = req.body?.permissions;
    if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) {
      return res.status(400).json({ message: "permissions object is required" });
    }

    const ops = Object.entries(permissions).map(([role, names]) => ({
      updateOne: {
        filter: { role },
        update: {
          $set: {
            [field]: [...new Set((Array.isArray(names) ? names : []).map(String))],
          },
        },
        upsert: true,
      },
    }));

    if (ops.length) await RolePermission.bulkWrite(ops);

    const rows = await RolePermission.find().sort({ role: 1 });
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

router.put("/actions", saveField("actions"));
router.put("/menus", saveField("menus"));

export default router;
