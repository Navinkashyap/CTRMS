import express from "express";
import Evaluation from "../models/Evaluation.js";
import Vendor from "../models/Vendor.js";
import {
  resolveQualityRating,
  resolveDeadlineRating,
  recalculateVendorRatings,
} from "../utils/ratingHelpers.js";

const router = express.Router();

const formatEvaluation = (evaluation) => ({
  _id: evaluation._id,
  vendor: evaluation.vendor,
  projectCode: evaluation.projectCode,
  sourceLang: evaluation.sourceLang,
  targetLang: evaluation.targetLang,
  service: evaluation.service,
  taskQuality: evaluation.taskQuality,
  serviceQuality: evaluation.serviceQuality,
  taskQualityRating: evaluation.taskQualityRating,
  serviceQualityRating: evaluation.serviceQualityRating,
  deadline: evaluation.deadline,
  deadlineRating: evaluation.deadlineRating,
  remark: evaluation.remark,
  createdAt: evaluation.createdAt,
  updatedAt: evaluation.updatedAt,
});

const populateVendor = (query) =>
  query.populate("vendor", "code name email country serviceQuality taskQuality timelyDelivery");

async function buildEvaluationData(body) {
  const { vendorId, vendor, ...rest } = body;
  const resolvedVendorId = vendorId || vendor;

  if (!resolvedVendorId) {
    const error = new Error("Vendor is required");
    error.statusCode = 400;
    throw error;
  }

  const vendorDoc = await Vendor.findById(resolvedVendorId);
  if (!vendorDoc) {
    const error = new Error("Vendor not found");
    error.statusCode = 404;
    throw error;
  }

  const taskQualityRating = await resolveQualityRating(rest.taskQuality);
  const serviceQualityRating = await resolveQualityRating(rest.serviceQuality);
  const deadlineRating = await resolveDeadlineRating(rest.deadline);

  return {
    vendor: resolvedVendorId,
    projectCode: rest.projectCode,
    sourceLang: rest.sourceLang,
    targetLang: rest.targetLang,
    service: rest.service,
    taskQuality: rest.taskQuality,
    serviceQuality: rest.serviceQuality,
    taskQualityRating,
    serviceQualityRating,
    deadline: rest.deadline,
    deadlineRating,
    remark: rest.remark || "",
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const evaluations = await populateVendor(Evaluation.find()).sort({ createdAt: -1 });
    res.json(evaluations.map(formatEvaluation));
  } catch (error) {
    next(error);
  }
});

router.get("/vendor/:vendorId", async (req, res, next) => {
  try {
    const evaluations = await populateVendor(
      Evaluation.find({ vendor: req.params.vendorId })
    ).sort({ createdAt: -1 });
    res.json(evaluations.map(formatEvaluation));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const evaluation = await populateVendor(Evaluation.findById(req.params.id));
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }
    res.json(formatEvaluation(evaluation));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const evaluationData = await buildEvaluationData(req.body);
    const evaluation = await Evaluation.create(evaluationData);
    await recalculateVendorRatings(evaluation.vendor, Evaluation, Vendor);

    const populated = await populateVendor(Evaluation.findById(evaluation._id));
    res.status(201).json(formatEvaluation(populated));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = await Evaluation.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    const evaluationData = await buildEvaluationData({
      ...req.body,
      vendorId: req.body.vendorId || req.body.vendor || existing.vendor,
    });

    const evaluation = await Evaluation.findByIdAndUpdate(req.params.id, evaluationData, {
      new: true,
      runValidators: true,
    });

    await recalculateVendorRatings(existing.vendor, Evaluation, Vendor);
    if (String(existing.vendor) !== String(evaluation.vendor)) {
      await recalculateVendorRatings(evaluation.vendor, Evaluation, Vendor);
    }

    const populated = await populateVendor(Evaluation.findById(evaluation._id));
    res.json(formatEvaluation(populated));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    await recalculateVendorRatings(evaluation.vendor, Evaluation, Vendor);
    res.json({ message: "Evaluation deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
