import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
      // Sales Managers log in with this, so two accounts sharing a number
      // would make login ambiguous. Sparse so old/blank records don't clash.
      unique: true,
      sparse: true,
    },
    dob: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    role: {
      type: String,
      // "sales_manager" is a restricted role scoped to Clients/Contacts/Projects
      // (see permissions below); every other role keeps today's full access.
      default: "superadmin",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    // Only meaningful for role: "sales_manager". An existing admin toggles
    // these to control exactly what a Sales Manager can do. Ignored for
    // superadmin/other roles, which keep unrestricted access.
    permissions: {
      clients: {
        add: { type: Boolean, default: true },
        view: { type: Boolean, default: true },
        edit: { type: Boolean, default: true },
      },
      contacts: {
        add: { type: Boolean, default: true },
        view: { type: Boolean, default: true },
        edit: { type: Boolean, default: true },
      },
      projects: {
        create: { type: Boolean, default: true },
        view: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
