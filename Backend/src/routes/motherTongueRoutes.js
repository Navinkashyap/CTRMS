import express from "express";
import MotherTongue from "../models/MotherTongue.js";

const router = express.Router();

// Get all mother tongues
router.get("/", async (_req, res, next) => {
  try {
    const motherTongues = await MotherTongue.find().sort({ name: 1 });
    res.json(motherTongues);
  } catch (error) {
    next(error);
  }
});

// Create new mother tongue
router.post("/", async (req, res, next) => {
  try {
    const motherTongue = await MotherTongue.create(req.body);
    res.status(201).json(motherTongue);
  } catch (error) {
    next(error);
  }
});

// Update mother tongue
router.put("/:id", async (req, res, next) => {
  try {
    const motherTongue = await MotherTongue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!motherTongue) {
      return res.status(404).json({ message: "Mother tongue not found" });
    }
    res.json(motherTongue);
  } catch (error) {
    next(error);
  }
});

// Delete mother tongue
router.delete("/:id", async (req, res, next) => {
  try {
    const motherTongue = await MotherTongue.findByIdAndDelete(req.params.id);
    if (!motherTongue) {
      return res.status(404).json({ message: "Mother tongue not found" });
    }
    res.json({ message: "Mother tongue deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
