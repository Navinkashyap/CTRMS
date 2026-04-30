import mongoose from "mongoose";

const typeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Type name is required"],
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

// Virtual for id to match frontend expectation
typeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are serialized
typeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model("Type", typeSchema);
