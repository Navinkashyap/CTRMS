import express from "express";
import Currency from "../models/Currency.js";

const router = express.Router();

// Get all currencies
router.get("/", async (_req, res, next) => {
  try {
    const currencies = await Currency.find().sort({ name: 1 });
    res.json(currencies);
  } catch (error) {
    next(error);
  }
});

// Create new currency
router.post("/", async (req, res, next) => {
  try {
    const currency = await Currency.create(req.body);
    res.status(201).json(currency);
  } catch (error) {
    next(error);
  }
});

// Update currency
router.put("/:id", async (req, res, next) => {
  try {
    const currency = await Currency.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!currency) {
      return res.status(404).json({ message: "Currency not found" });
    }
    res.json(currency);
  } catch (error) {
    next(error);
  }
});

// Delete currency
router.delete("/:id", async (req, res, next) => {
  try {
    const currency = await Currency.findByIdAndDelete(req.params.id);
    if (!currency) {
      return res.status(404).json({ message: "Currency not found" });
    }
    res.json({ message: "Currency deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
