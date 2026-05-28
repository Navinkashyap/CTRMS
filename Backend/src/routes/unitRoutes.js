import express from "express";
import Unit from "../models/Unit.js";

const router = express.Router();

// GET all units
router.get("/", async (req, res, next) => {
  try {
    const units = await Unit.find().sort({ name: 1 });
    res.json(units);
  } catch (err) {
    next(err);
  }
});

// POST new unit
router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    const unit = new Unit({ name });
    await unit.save();
    res.status(201).json(unit);
  } catch (err) {
    next(err);
  }
});

// PUT update unit
router.put("/:id", async (req, res, next) => {
  try {
    const { name } = req.body;
    const unit = await Unit.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.json(unit);
  } catch (err) {
    next(err);
  }
});

// DELETE unit
router.delete("/:id", async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.json({ message: "Unit deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
