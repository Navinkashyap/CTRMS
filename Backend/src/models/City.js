import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
      unique: true,
    },
    shortName: {
      type: String,
      required: [true, "Short name is required"],
      trim: true,
      uppercase: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
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

export default mongoose.model("City", citySchema);
