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
    title: {
      type: String,
      enum: ["Mr.", "Mrs.", "Ms.", "Dr.", ""],
      default: "",
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
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
    phoneCode: {
      type: String,
      trim: true,
      default: "+1",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    mobileCode: {
      type: String,
      trim: true,
      default: "+1",
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
    },
    altEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    altPhoneCode: {
      type: String,
      trim: true,
      default: "+1",
    },
    altPhone: {
      type: String,
      trim: true,
      default: "",
    },
    teamsId: {
      type: String,
      trim: true,
      default: "",
    },
    remark: {
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
    pinCode: {
      type: String,
      trim: true,
      default: "",
    },
    panDocument: {
      type: String,
      default: "",
    },
    aadhaarDocument: {
      type: String,
      default: "",
    },
    resume: {
      type: String,
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

// Keep the display `name` in sync whenever the profile form edits title/firstName/lastName
vendorSchema.pre("save", function (next) {
  if (this.isModified("firstName") || this.isModified("lastName") || this.isModified("title")) {
    const composed = [this.title, this.firstName, this.lastName].filter(Boolean).join(" ").trim();
    if (composed) this.name = composed;
  }
  next();
});

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
