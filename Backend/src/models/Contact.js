import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, trim: true },
    countryCode: { type: String, default: "+91" },
    company: { type: String, trim: true },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    dob: { type: String }, // Storing as string for simplicity as per UI
    clientId: { type: String },
    clientCode: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", ContactSchema);
