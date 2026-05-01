import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      unique: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    parentService: {
      type: String,
      trim: true,
      default: "Root",
    },
    priority: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Service", serviceSchema);
