import mongoose from "mongoose";

const languagePairSchema = new mongoose.Schema(
  {
    source: { type: String, trim: true, default: "" },
    target: { type: String, trim: true, default: "" },
    rateCurrency: { type: String, trim: true, default: "INR" },
    rate: { type: String, trim: true, default: "" },
    hourlyCurrency: { type: String, trim: true, default: "INR" },
    hourly: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Denied"],
      default: "Pending",
    },
  },
  { _id: false }
);

const referenceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true, default: "" },
    contactPerson: { type: String, trim: true, default: "" },
    designation: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    contactNo: { type: String, trim: true, default: "" },
    checked: { type: String, enum: ["Yes", "No"], default: "No" },
  },
  { _id: false }
);

const vendorTranslationServiceSchema = new mongoose.Schema(
  {
    vendorCode: {
      type: String,
      required: [true, "Vendor code is required"],
      trim: true,
      unique: true,
    },
    translationExperience: {
      type: String,
      trim: true,
      default: "",
    },
    tools: {
      type: [String],
      default: [],
    },
    specializations: {
      type: [String],
      default: [],
    },
    languagePairs: {
      type: [languagePairSchema],
      default: [],
    },
    references: {
      type: [referenceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "VendorTranslationService",
  vendorTranslationServiceSchema
);
