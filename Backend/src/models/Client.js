import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Onboarding", "Client", "Prospect Warm", "Prospect Cold"],
      default: "Active",
    },
    membership: {
      type: String,
      trim: true,
      default: "",
    },
    membershipCode: {
      type: String,
      required: [true, "Membership code is required"],
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    zip: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    currency: {
      type: String,
      trim: true,
      default: "USD",
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      trim: true,
      default: "System Admin",
    },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Client", clientSchema);
