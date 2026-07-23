import express from "express";
import VendorTranslationService from "../models/VendorTranslationService.js";

const router = express.Router();

// Keep only the last 4 digits of a card number; never persist the full PAN.
const maskCardNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length > 4 ? `**** **** **** ${digits.slice(-4)}` : String(value || "");
};

const maskAccountNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length > 4 ? `****${digits.slice(-4)}` : String(value || "");
};

const buildPaymentSummary = (method, fullDetails = {}) => {
  if (method === "PayPal") return fullDetails.email || "Not provided";
  if (method?.includes("Card")) return maskCardNumber(fullDetails.cardNumber);
  if (fullDetails.accountNumber) return `Account ${maskAccountNumber(fullDetails.accountNumber)}`;
  return "Recently added";
};

const sanitizePaymentDetails = (method, fullDetails = {}) => {
  const sanitized = { ...fullDetails };
  if (method?.includes("Card") && sanitized.cardNumber) {
    sanitized.cardNumber = maskCardNumber(sanitized.cardNumber);
  }
  return sanitized;
};

// Get (or lazily create) the translation service profile for a vendor by code
router.get("/:vendorCode", async (req, res, next) => {
  try {
    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode },
      { $setOnInsert: { vendorCode: req.params.vendorCode } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Update selected services & language pairs (Services & Languages tab)
router.put("/:vendorCode/services", async (req, res, next) => {
  try {
    const { selectedServices, languagePairs } = req.body;
    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode },
      { vendorCode: req.params.vendorCode, selectedServices, languagePairs },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Update mother tongue, tools & expertise (Expertise & Tools tab)
router.put("/:vendorCode/expertise", async (req, res, next) => {
  try {
    const { motherTongue, tools, expertiseList, translationExp } = req.body;
    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode },
      { vendorCode: req.params.vendorCode, motherTongue, tools, expertiseList, translationExp },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Replace the reference list (PM-facing vendor profile view)
router.put("/:vendorCode/references", async (req, res, next) => {
  try {
    const { references } = req.body;
    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode },
      { vendorCode: req.params.vendorCode, references },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Set the approval status of a single language pair (PM reviewing a vendor's rate card)
router.put("/:vendorCode/language-pairs/:pairId/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Approved"].includes(status)) {
      return res.status(400).json({ message: "status must be 'Pending' or 'Approved'" });
    }
    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode, "languagePairs._id": req.params.pairId },
      { $set: { "languagePairs.$.status": status } },
      { new: true, runValidators: true }
    );
    if (!service) {
      return res.status(404).json({ message: "Language pair not found" });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Add a new payment method (Financial Details tab)
router.post("/:vendorCode/payment-methods", async (req, res, next) => {
  try {
    const { country, method, fullDetails } = req.body;
    const summary = buildPaymentSummary(method, fullDetails);
    const sanitizedDetails = sanitizePaymentDetails(method, fullDetails);

    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode },
      {
        $setOnInsert: { vendorCode: req.params.vendorCode },
        $push: { paymentMethods: { country, method, summary, fullDetails: sanitizedDetails } },
      },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

// Update an existing payment method
router.put("/:vendorCode/payment-methods/:paymentId", async (req, res, next) => {
  try {
    const { country, method, fullDetails } = req.body;
    const summary = buildPaymentSummary(method, fullDetails);
    const sanitizedDetails = sanitizePaymentDetails(method, fullDetails);

    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode, "paymentMethods._id": req.params.paymentId },
      {
        $set: {
          "paymentMethods.$.country": country,
          "paymentMethods.$.method": method,
          "paymentMethods.$.summary": summary,
          "paymentMethods.$.fullDetails": sanitizedDetails,
        },
      },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Delete a payment method
router.delete("/:vendorCode/payment-methods/:paymentId", async (req, res, next) => {
  try {
    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode },
      { $pull: { paymentMethods: { _id: req.params.paymentId } } },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: "Translation service profile not found" });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
});

export default router;
