import mongoose from "mongoose";

const specializationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Specialization name is required"],
      trim: true,
      unique: true,
    },
    parent: {
      type: String,
      default: "Root",
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

export default mongoose.model("Specialization", specializationSchema);
