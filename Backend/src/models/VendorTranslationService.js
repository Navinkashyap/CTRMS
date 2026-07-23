import mongoose from "mongoose";

const languagePairSchema = new mongoose.Schema(
  {
    service: { type: String, trim: true, default: "Translation" },
    source: { type: String, trim: true, default: "" },
    target: { type: [String], default: [] },
    expertise: { type: String, trim: true, default: "General" },
    rateCurrency: { type: String, trim: true, default: "USD" },
    rate: { type: String, trim: true, default: "" },
    unit: { type: String, trim: true, default: "word" },
    hourlyCurrency: { type: String, trim: true, default: "USD" },
    hourly: { type: String, trim: true, default: "" },
    // Set by a PM when reviewing the vendor's rate card during vendor approval.
    status: { type: String, enum: ["Pending", "Approved"], default: "Pending" },
  },
  { timestamps: true }
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
  { timestamps: true }
);

const paymentMethodSchema = new mongoose.Schema(
  {
    country: { type: String, trim: true, default: "US" },
    method: { type: String, trim: true, default: "Wire Transfer" },
    // Short masked label for list views, e.g. "Ending in 1234"
    summary: { type: String, trim: true, default: "" },
    // Bank/PayPal/card details. Card numbers are masked to last 4 digits before storage;
    // other fields (bank account, routing, PAN) are kept in full since payouts require them.
    fullDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const vendorTranslationServiceSchema = new mongoose.Schema(
  {
    vendorCode: {
      type: String,
      required: [true, "Vendor code is required"],
      trim: true,
      unique: true,
    },
    selectedServices: {
      type: [String],
      default: ["Translation"],
    },
    languagePairs: {
      type: [languagePairSchema],
      default: [],
    },
    motherTongue: {
      type: String,
      trim: true,
      default: "",
    },
    translationExp: {
      type: String,
      trim: true,
      default: "",
    },
    tools: {
      type: [String],
      default: [],
    },
    expertiseList: {
      type: [String],
      default: [],
    },
    paymentMethods: {
      type: [paymentMethodSchema],
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
