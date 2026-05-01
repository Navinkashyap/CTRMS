import express from "express";
import City from "../models/City.js";

const router = express.Router();

// Get all cities
router.get("/", async (_req, res, next) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    res.json(cities);
  } catch (error) {
    next(error);
  }
});

// Create new city
router.post("/", async (req, res, next) => {
  try {
    const city = await City.create(req.body);
    res.status(201).json(city);
  } catch (error) {
    next(error);
  }
});

// Update city
router.put("/:id", async (req, res, next) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    res.json(city);
  } catch (error) {
    next(error);
  }
});

// Delete city
router.delete("/:id", async (req, res, next) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    res.json({ message: "City deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
