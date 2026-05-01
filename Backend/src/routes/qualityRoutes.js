import express from "express";
import Quality from "../models/Quality.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const qualities = await Quality.find().sort({ rating: -1 });
    res.json(qualities);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const quality = await Quality.create(req.body);
    res.status(201).json(quality);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const quality = await Quality.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!quality) {
      return res.status(404).json({ message: "Quality not found" });
    }
    res.json(quality);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const quality = await Quality.findByIdAndDelete(req.params.id);
    if (!quality) {
      return res.status(404).json({ message: "Quality not found" });
    }
    res.json({ message: "Quality deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
