import express from "express";
import Country from "../models/Country.js";

const router = express.Router();

// Get all countries
router.get("/", async (_req, res, next) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.json(countries);
  } catch (error) {
    next(error);
  }
});

// Create new country
router.post("/", async (req, res, next) => {
  try {
    const country = await Country.create(req.body);
    res.status(201).json(country);
  } catch (error) {
    next(error);
  }
});

// Update country
router.put("/:id", async (req, res, next) => {
  try {
    const country = await Country.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json(country);
  } catch (error) {
    next(error);
  }
});

// Delete country
router.delete("/:id", async (req, res, next) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.json({ message: "Country deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
