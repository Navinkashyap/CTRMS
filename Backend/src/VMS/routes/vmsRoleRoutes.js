import express from "express";
import VMSRole from "../models/VMSRole.js";

const router = express.Router();

// GET /api/vms/roles
router.get("/", async (req, res, next) => {
  try {
    const roles = await VMSRole.find({}).sort({ createdAt: -1 });
    res.json(roles);
  } catch (error) {
    next(error);
  }
});

// POST /api/vms/roles
router.post("/", async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const existingRole = await VMSRole.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingRole) {
      return res.status(409).json({ message: "Role already exists" });
    }

    const newRole = new VMSRole({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newRole.save();
    res.status(201).json({ message: "Role created successfully", role: newRole });
  } catch (error) {
    next(error);
  }
});

// PUT /api/vms/roles/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const role = await VMSRole.findById(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (name !== undefined) {
      // Check for duplicate names on rename
      const duplicate = await VMSRole.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, "i") }, 
        _id: { $ne: id } 
      });
      if (duplicate) return res.status(409).json({ message: "Role name already exists" });
      role.name = name;
    }
    
    if (description !== undefined) role.description = description;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();
    res.json({ message: "Role updated successfully", role });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vms/roles/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await VMSRole.findByIdAndDelete(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
