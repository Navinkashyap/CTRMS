import Quality from "../models/Quality.js";
import Deadline from "../models/Deadline.js";

const FALLBACK_QUALITY_RATINGS = {
  Excellent: 5,
  Good: 4,
  Average: 3,
  Poor: 2,
};

const FALLBACK_DEADLINE_RATINGS = {
  "On Time": 5,
  Delayed: 2,
};

export async function resolveQualityRating(label) {
  if (!label) return 0;

  const quality = await Quality.findOne({
    type: { $regex: new RegExp(`^${label}$`, "i") },
    status: "Active",
  });

  if (quality) return quality.rating;
  return FALLBACK_QUALITY_RATINGS[label] ?? 0;
}

export async function resolveDeadlineRating(label) {
  if (!label) return 0;

  const deadline = await Deadline.findOne({
    name: { $regex: new RegExp(`^${label}$`, "i") },
    status: "Active",
  });

  if (deadline) return deadline.rating;
  return FALLBACK_DEADLINE_RATINGS[label] ?? 0;
}

export async function recalculateVendorRatings(vendorId, Evaluation, Vendor) {
  const evaluations = await Evaluation.find({ vendor: vendorId });

  if (evaluations.length === 0) {
    await Vendor.findByIdAndUpdate(vendorId, {
      taskQuality: 0,
      serviceQuality: 0,
      timelyDelivery: 0,
    });
    return;
  }

  const average = (field) => {
    const total = evaluations.reduce((sum, item) => sum + (item[field] || 0), 0);
    return Math.round((total / evaluations.length) * 10) / 10;
  };

  await Vendor.findByIdAndUpdate(vendorId, {
    taskQuality: average("taskQualityRating"),
    serviceQuality: average("serviceQualityRating"),
    timelyDelivery: average("deadlineRating"),
  });
}
