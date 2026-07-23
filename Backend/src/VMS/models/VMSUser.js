import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const vmsUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
    },
    countryCode: {
      type: String,
      trim: true,
      default: "",
    },
    contactNo: {
      type: String,
      trim: true,
      default: "",
    },
    dob: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      trim: true,
      default: "",
    },
    // PM Specific Profile Fields
    title: { type: String, trim: true, default: "Mr." },
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    cityName: { type: String, trim: true, default: "" },
    stateName: { type: String, trim: true, default: "" },
    countryName: { type: String, trim: true, default: "" },
    pinCode: { type: String, trim: true, default: "" },
    teamsId: { type: String, trim: true, default: "" },
    altEmail: { type: String, trim: true, default: "" },
    altCountryCode: { type: String, trim: true, default: "+1" },
    altContactNo: { type: String, trim: true, default: "" },
    remark: { type: String, trim: true, default: "" },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
vmsUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
vmsUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("VMSUser", vmsUserSchema);
