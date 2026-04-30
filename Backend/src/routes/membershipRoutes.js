import express from "express";
import Membership from "../models/Membership.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const memberships = await Membership.find().sort({ createdAt: -1 });
    res.json(memberships);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const membership = await Membership.create(req.body);
    res.status(201).json(membership);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const membership = await Membership.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    res.json(membership);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const membership = await Membership.findByIdAndDelete(req.params.id);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    res.json({ message: "Membership deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
