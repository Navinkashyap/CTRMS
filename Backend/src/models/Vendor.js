import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
      unique: true,
    },
    password: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
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

// Hash password before saving (only if password is modified and not empty)
vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
vendorSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Vendor", vendorSchema);
