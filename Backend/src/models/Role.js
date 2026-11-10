import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true, trim: true },
    abbreviation: { type: String, trim: true, default: "" },
    level: { type: Number, default: 1 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Role", RoleSchema);
