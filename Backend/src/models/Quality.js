import mongoose from "mongoose";

const qualitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Quality type is required"],
      trim: true,
      unique: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating value is required"],
      min: 1,
      max: 5,
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

export default mongoose.model("Quality", qualitySchema);
