import mongoose from "mongoose";

const motherTongueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Mother tongue name is required"],
      trim: true,
      unique: true,
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

export default mongoose.model("MotherTongue", motherTongueSchema);
