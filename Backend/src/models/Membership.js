import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Membership name is required"],
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
membershipSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are serialized
membershipSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model("Membership", membershipSchema);
