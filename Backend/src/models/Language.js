import mongoose from "mongoose";

const languageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Language name is required"],
      trim: true,
      unique: true,
    },
    iso639_1: { type: String, trim: true, default: "" },
    twoLetterCode: { type: String, trim: true, default: "" },
    threeLetterCode: { type: String, trim: true, default: "" },
    localeCode: {
      type: String,
      trim: true,
      default: "",
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

export default mongoose.model("Language", languageSchema);
