import express from "express";
import State from "../models/State.js";

const router = express.Router();

// Get all states
router.get("/", async (_req, res, next) => {
  try {
    const states = await State.find().sort({ name: 1 });
    res.json(states);
  } catch (error) {
    next(error);
  }
});

// Create new state
router.post("/", async (req, res, next) => {
  try {
    const state = await State.create(req.body);
    res.status(201).json(state);
  } catch (error) {
    next(error);
  }
});

// Update state
router.put("/:id", async (req, res, next) => {
  try {
    const state = await State.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    res.json(state);
  } catch (error) {
    next(error);
  }
});

// Delete state
router.delete("/:id", async (req, res, next) => {
  try {
    const state = await State.findByIdAndDelete(req.params.id);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    res.json({ message: "State deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
