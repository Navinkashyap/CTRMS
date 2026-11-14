import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    salutation: { type: String, default: "Mr." },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, trim: true },
    countryCode: { type: String, default: "+91" },
    isWhatsapp: { type: Boolean, default: false },
    company: { type: String, trim: true },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    dob: { type: String }, // Storing as string for simplicity as per UI
    remark: { type: String, trim: true },
    clientId: { type: String },
    clientCode: { type: String },
    // Location details
    address: { type: String, trim: true, default: "" },
    fullAddress: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    region: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    zip: { type: String, trim: true, default: "" },
    zipCode: { type: String, trim: true, default: "" },
  },
  { timestamps: true, strict: false }
);

export default mongoose.model("Contact", ContactSchema);
