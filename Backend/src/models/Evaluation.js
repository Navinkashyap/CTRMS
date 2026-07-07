import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor is required"],
    },
    projectCode: {
      type: String,
      required: [true, "Project code is required"],
      trim: true,
    },
    sourceLang: {
      type: String,
      required: [true, "Source language is required"],
      trim: true,
    },
    targetLang: {
      type: String,
      required: [true, "Target language is required"],
      trim: true,
    },
    service: {
      type: String,
      required: [true, "Service is required"],
      trim: true,
    },
    taskQuality: {
      type: String,
      required: [true, "Task quality is required"],
      trim: true,
    },
    serviceQuality: {
      type: String,
      required: [true, "Service quality is required"],
      trim: true,
    },
    taskQualityRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    serviceQualityRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    deadline: {
      type: String,
      required: [true, "Deadline status is required"],
      trim: true,
    },
    deadlineRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    remark: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Evaluation", evaluationSchema);
