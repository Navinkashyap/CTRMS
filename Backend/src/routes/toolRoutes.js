import express from "express";
import Tool from "../models/Tool.js";

const router = express.Router();

// Get all tools
router.get("/", async (_req, res, next) => {
  try {
    const tools = await Tool.find().sort({ name: 1 });
    res.json(tools);
  } catch (error) {
    next(error);
  }
});

// Create new tool
router.post("/", async (req, res, next) => {
  try {
    const tool = await Tool.create(req.body);
    res.status(201).json(tool);
  } catch (error) {
    next(error);
  }
});

// Update tool
router.put("/:id", async (req, res, next) => {
  try {
    const tool = await Tool.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }
    res.json(tool);
  } catch (error) {
    next(error);
  }
});

// Delete tool
router.delete("/:id", async (req, res, next) => {
  try {
    const tool = await Tool.findByIdAndDelete(req.params.id);
    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }
    res.json({ message: "Tool deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
