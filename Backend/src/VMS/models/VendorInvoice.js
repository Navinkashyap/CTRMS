import mongoose from "mongoose";

// Kept separate from the Admin's client-billing Invoice model (src/models/Invoice.js):
// that model bills a client on Perfectrans' own bank details (money coming in),
// while this one is a vendor billing Perfectrans for completed work (money going
// out) — different direction, different fields (vendor code/type, no CGST/SGST
// split, vendor's own payment details). Reusing one schema for both would force
// vendor data into fields that mean something else.
const particularSchema = new mongoose.Schema(
  {
    task: { type: String, trim: true, default: "" },
    text: { type: String, trim: true, default: "" },
    src: { type: String, trim: true, default: "" },
    trgt: { type: String, trim: true, default: "" },
    volume: { type: Number, default: 0 },
    unit: { type: String, trim: true, default: "" },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const vendorInvoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, trim: true, required: true },
    date: { type: String, trim: true, default: "" },

    vendorCode: { type: String, trim: true, default: "", index: true },
    vendorName: { type: String, trim: true, default: "" },
    vendorType: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    contactNo: { type: String, trim: true, default: "" },

    // The job this invoice bills for, if created from a completed job. Kept
    // in sync with Job.invoiceId/paymentStatus (see vendorInvoiceRoutes.js).
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },

    applyGst: { type: Boolean, default: true },
    paymentCountry: { type: String, trim: true, default: "US" },
    paymentMethod: { type: String, trim: true, default: "Bank Account (ACH)" },

    particulars: { type: [particularSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue", "Draft"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("VendorInvoice", vendorInvoiceSchema);
