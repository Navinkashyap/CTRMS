import express from "express";
import VendorTranslationService from "../models/VendorTranslationService.js";

const router = express.Router();

// Get translation service profile for a vendor by code
router.get("/:vendorCode", async (req, res, next) => {
  try {
    const service = await VendorTranslationService.findOne({
      vendorCode: req.params.vendorCode,
    });
    if (!service) {
      return res.status(404).json({ message: "Translation service profile not found" });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Create or update translation service profile for a vendor by code
router.put("/:vendorCode", async (req, res, next) => {
  try {
    const { translationExperience, tools, specializations, languagePairs, references } = req.body;

    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode },
      {
        vendorCode: req.params.vendorCode,
        translationExperience,
        tools,
        specializations,
        languagePairs,
        references,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(service);
  } catch (error) {
    next(error);
  }
});

export default router;
