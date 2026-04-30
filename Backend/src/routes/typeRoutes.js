import express from "express";
import Type from "../models/Type.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const types = await Type.find().sort({ createdAt: -1 });
    res.json(types);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const type = await Type.create(req.body);
    res.status(201).json(type);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const type = await Type.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!type) {
      return res.status(404).json({ message: "Type not found" });
    }

    res.json(type);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const type = await Type.findByIdAndDelete(req.params.id);

    if (!type) {
      return res.status(404).json({ message: "Type not found" });
    }

    res.json({ message: "Type deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
