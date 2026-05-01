import express from "express";
import Deadline from "../models/Deadline.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const deadlines = await Deadline.find().sort({ rating: -1 });
    res.json(deadlines);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const deadline = await Deadline.create(req.body);
    res.status(201).json(deadline);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const deadline = await Deadline.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!deadline) {
      return res.status(404).json({ message: "Deadline not found" });
    }
    res.json(deadline);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deadline = await Deadline.findByIdAndDelete(req.params.id);
    if (!deadline) {
      return res.status(404).json({ message: "Deadline not found" });
    }
    res.json({ message: "Deadline deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
