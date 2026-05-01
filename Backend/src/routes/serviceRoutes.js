import express from "express";
import Service from "../models/Service.js";

const router = express.Router();

// Get all services
router.get("/", async (_req, res, next) => {
  try {
    const services = await Service.find().sort({ priority: 1, name: 1 });
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// Create new service
router.post("/", async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

// Update service
router.put("/:id", async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Delete service
router.delete("/:id", async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
