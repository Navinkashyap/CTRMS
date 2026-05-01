import express from "express";
import Language from "../models/Language.js";

const router = express.Router();

// Get all languages
router.get("/", async (_req, res, next) => {
  try {
    const languages = await Language.find().sort({ name: 1 });
    res.json(languages);
  } catch (error) {
    next(error);
  }
});

// Create new language
router.post("/", async (req, res, next) => {
  try {
    const language = await Language.create(req.body);
    res.status(201).json(language);
  } catch (error) {
    next(error);
  }
});

// Update language
router.put("/:id", async (req, res, next) => {
  try {
    const language = await Language.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }
    res.json(language);
  } catch (error) {
    next(error);
  }
});

// Delete language
router.delete("/:id", async (req, res, next) => {
  try {
    const language = await Language.findByIdAndDelete(req.params.id);
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }
    res.json({ message: "Language deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
