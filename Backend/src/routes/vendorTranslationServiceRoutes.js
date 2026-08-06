import express from "express";
import VendorTranslationService from "../models/VendorTranslationService.js";
import Vendor from "../models/Vendor.js";

const router = express.Router();

// A vendor's overall approval state follows its rate card: any rejected rate rejects
// the vendor, all rates approved (and at least one rate present) approves it.
const syncVendorApproval = async (vendorCode, languagePairs = []) => {
  const vendor = await Vendor.findOne({ code: vendorCode });
  if (!vendor) return;

  const statuses = languagePairs.map((p) => p.status || "Pending");
  let approvalStatus = "Pending";
  if (statuses.some((s) => s === "Rejected")) {
    approvalStatus = "Rejected";
  } else if (statuses.length > 0 && statuses.every((s) => s === "Approved")) {
    approvalStatus = "Approved";
  }

  if (vendor.approvalStatus !== approvalStatus) {
    vendor.approvalStatus = approvalStatus;
    if (approvalStatus !== "Rejected") vendor.approvalRemark = "";
    await vendor.save();
  }
};

// A rate keeps its review decision only while the reviewed values stay the same.
// Any change to the pair puts it back in the queue as Pending.
const rateSignature = (pair = {}) =>
  [
    pair.service || "",
    pair.source || "",
    (Array.isArray(pair.target) ? [...pair.target] : [pair.target || ""]).join("|"),
    pair.rateCurrency || "",
    pair.rate || "",
    pair.unit || "",
  ].join("::");

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
    const { selectedServices, languagePairs = [] } = req.body;

    const existing = await VendorTranslationService.findOne({ vendorCode: req.params.vendorCode });
    const existingById = new Map(
      (existing?.languagePairs || []).map((p) => [String(p._id), p])
    );

    // Carry the Vendor Manager's decision over to pairs that were not changed.
    const mergedPairs = languagePairs.map((pair) => {
      const previous = pair._id ? existingById.get(String(pair._id)) : null;
      const unchanged = previous && rateSignature(previous) === rateSignature(pair);
      return {
        ...pair,
        status: unchanged ? previous.status : "Pending",
        statusRemark: unchanged ? previous.statusRemark : "",
        reviewedAt: unchanged ? previous.reviewedAt : undefined,
      };
    });

    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode },
      { vendorCode: req.params.vendorCode, selectedServices, languagePairs: mergedPairs },
      { new: true, upsert: true, runValidators: true }
    );

    await syncVendorApproval(req.params.vendorCode, service.languagePairs);
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

// Set the approval status of a single language pair (Vendor Manager reviewing a rate card)
router.put("/:vendorCode/language-pairs/:pairId/status", async (req, res, next) => {
  try {
    const { status, statusRemark } = req.body;
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be 'Pending', 'Approved' or 'Rejected'" });
    }
    const service = await VendorTranslationService.findOneAndUpdate(
      { vendorCode: req.params.vendorCode, "languagePairs._id": req.params.pairId },
      {
        $set: {
          "languagePairs.$.status": status,
          "languagePairs.$.statusRemark": status === "Rejected" ? (statusRemark || "") : "",
          "languagePairs.$.reviewedAt": new Date(),
        },
      },
      { new: true, runValidators: true }
    );
    if (!service) {
      return res.status(404).json({ message: "Language pair not found" });
    }
    await syncVendorApproval(req.params.vendorCode, service.languagePairs);
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Approve or reject every rate of one service at once
router.put("/:vendorCode/services/:serviceName/status", async (req, res, next) => {
  try {
    const { status, statusRemark } = req.body;
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be 'Pending', 'Approved' or 'Rejected'" });
    }

    const service = await VendorTranslationService.findOne({ vendorCode: req.params.vendorCode });
    if (!service) {
      return res.status(404).json({ message: "Translation service profile not found" });
    }

    const serviceName = decodeURIComponent(req.params.serviceName);
    service.languagePairs.forEach((pair) => {
      if (pair.service === serviceName) {
        pair.status = status;
        pair.statusRemark = status === "Rejected" ? (statusRemark || "") : "";
        pair.reviewedAt = new Date();
      }
    });
    await service.save();

    await syncVendorApproval(req.params.vendorCode, service.languagePairs);
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
