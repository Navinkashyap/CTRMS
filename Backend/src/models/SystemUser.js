import mongoose from "mongoose";

// Staff directory shown on the "Manage Users" page. These records do not log
// in — login accounts live in the Admin collection.
const SystemUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, trim: true, default: "Admin" },
    mobile: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("SystemUser", SystemUserSchema);
