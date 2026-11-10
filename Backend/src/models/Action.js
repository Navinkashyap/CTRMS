import mongoose from "mongoose";

const ActionSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Action", ActionSchema);
