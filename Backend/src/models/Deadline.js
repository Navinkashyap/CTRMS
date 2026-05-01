import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Deadline name is required"],
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

export default mongoose.model("Deadline", deadlineSchema);
