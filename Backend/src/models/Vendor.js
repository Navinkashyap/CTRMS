import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Vendor code is required"],
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    motherTongue: {
      type: String,
      trim: true,
      default: "N/A",
    },
    ptft: {
      type: String,
      enum: ["PT", "FT"],
      default: "FT",
    },
    availability: {
      type: String,
      default: "Full Time",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    serviceQuality: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    taskQuality: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    timelyDelivery: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Vendor", vendorSchema);
