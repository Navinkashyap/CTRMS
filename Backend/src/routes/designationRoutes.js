import express from "express";
import Designation from "../models/Designation.js";

const router = express.Router();

// GET all designations
router.get("/", async (req, res, next) => {
  try {
    const designations = await Designation.find().sort({ name: 1 });
    res.json(designations);
  } catch (err) {
    next(err);
  }
});

// POST new designation
router.post("/", async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Designation name is required." });
    }
    const designation = new Designation({
      name: name.trim(),
      description: (description || "").trim(),
      status: status || "Active",
    });
    await designation.save();
    res.status(201).json(designation);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A designation with this name already exists." });
    }
    next(err);
  }
});

// PUT update designation
router.put("/:id", async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      {
        name: name ? name.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        status: status || undefined,
      },
      { new: true, runValidators: true }
    );
    if (!designation) return res.status(404).json({ message: "Designation not found" });
    res.json(designation);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A designation with this name already exists." });
    }
    next(err);
  }
});

// DELETE designation
router.delete("/:id", async (req, res, next) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    if (!designation) return res.status(404).json({ message: "Designation not found" });
    res.json({ message: "Designation deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;

