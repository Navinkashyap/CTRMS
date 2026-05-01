import express from "express";
import Specialization from "../models/Specialization.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const specializations = await Specialization.find().sort({ name: 1 });
    res.json(specializations);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const specialization = await Specialization.create(req.body);
    res.status(201).json(specialization);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const specialization = await Specialization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!specialization) {
      return res.status(404).json({ message: "Specialization not found" });
    }
    res.json(specialization);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const specialization = await Specialization.findByIdAndDelete(req.params.id);
    if (!specialization) {
      return res.status(404).json({ message: "Specialization not found" });
    }
    res.json({ message: "Specialization deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
