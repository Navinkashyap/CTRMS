import mongoose from "mongoose";

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "State name is required"],
      trim: true,
      unique: true,
    },
    shortName: {
      type: String,
      required: [true, "Short name is required"],
      trim: true,
      uppercase: true,
    },
    country: {
      type: String,
      required: [true, "Country name is required"],
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

export default mongoose.model("State", stateSchema);
