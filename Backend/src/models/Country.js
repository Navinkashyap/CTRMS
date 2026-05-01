import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Country name is required"],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, "Country code is required"],
      trim: true,
    },
    shortName: {
      type: String,
      required: [true, "Short name is required"],
      trim: true,
      uppercase: true,
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

export default mongoose.model("Country", countrySchema);
