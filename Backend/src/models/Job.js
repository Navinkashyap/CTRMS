import mongoose from "mongoose";

const jobTaskSchema = new mongoose.Schema(
  {
    type: { type: String, trim: true, default: "" },
    quantity: { type: String, trim: true, default: "" },
    unit: { type: String, trim: true, default: "word" },
    rate: { type: String, trim: true, default: "" },
    currency: { type: String, trim: true, default: "USD" },
    fee: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const deliveredFileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
    size: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

// The admin's reference/working files for the project this PO covers, copied
// in at PO-creation time so the vendor has something real to download instead
// of the placeholder files the admin/PM see on the project itself.
const jobFileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    po: { type: String, required: [true, "PO number is required"], trim: true, unique: true },

    project: { type: mongoose.Schema.Types.ObjectId, ref: "VMSProject", default: null },
    projectId: { type: String, trim: true, default: "" },
    projectName: { type: String, trim: true, default: "" },

    vendorCode: { type: String, trim: true, default: "", index: true },
    vendorName: { type: String, trim: true, default: "" },
    pm: { type: String, trim: true, default: "" },

    service: { type: String, trim: true, default: "Translation" },
    jobType: { type: String, trim: true, default: "" },
    documentType: { type: String, trim: true, default: "" },
    serviceType: { type: String, trim: true, default: "" },
    lang: { type: String, trim: true, default: "" },
    sourceLanguage: { type: String, trim: true, default: "" },
    targetLanguages: { type: String, trim: true, default: "" },

    quantity: { type: String, trim: true, default: "" },
    weightedQuantity: { type: String, trim: true, default: "" },
    volumeOfWork: { type: String, trim: true, default: "" },
    priority: { type: String, trim: true, default: "Normal" },

    description: { type: String, trim: true, default: "" },
    instructions: { type: String, trim: true, default: "" },

    startDate: { type: String, trim: true, default: "" },
    deadline: { type: String, trim: true, default: "" },

    poFrom: { type: String, trim: true, default: "" },
    poDate: { type: String, trim: true, default: "" },
    poCurrency: { type: String, trim: true, default: "USD" },
    poPaymentTerms: { type: String, trim: true, default: "Net 30" },
    poNotes: { type: String, trim: true, default: "" },
    poTasks: { type: [jobTaskSchema], default: [] },
    totalAmount: { type: String, trim: true, default: "" },
    unitPrice: { type: String, trim: true, default: "" },

    clientName: { type: String, trim: true, default: "" },
    clientEmail: { type: String, trim: true, default: "" },
    clientPhone: { type: String, trim: true, default: "" },
    contactPerson: { type: String, trim: true, default: "" },

    // PO's own financial/issuance lifecycle (PM-facing, independent of the vendor's response).
    status: {
      type: String,
      enum: ["Not Issued", "Pending", "Issued", "Paid"],
      default: "Not Issued",
    },

    // Vendor-facing job/offer lifecycle. Empty until a vendor is assigned.
    // Pending: offer sent, awaiting vendor accept/reject.
    // Rejected: vendor declined.
    // In Progress: vendor accepted, work underway.
    // Completed: vendor submitted deliverables.
    vendorStatus: {
      type: String,
      enum: ["", "Pending", "Rejected", "In Progress", "Completed"],
      default: "",
    },
    // When the vendor most recently rejected this offer. Cleared whenever the
    // PM reassigns/republishes it. Lets the PM see *that* and *when* a vendor
    // said no instead of the rejection being silently invisible.
    rejectedAt: { type: Date, default: null },

    // Reference/working files the vendor can download for this job. Copied
    // from the project at PO-creation time (see poRoutes/PMPO) rather than
    // resolved on the fly, since a job can outlive edits to the project.
    referenceFiles: { type: [jobFileSchema], default: [] },
    workingFiles: { type: [jobFileSchema], default: [] },

    deliveredFiles: { type: [deliveredFileSchema], default: [] },
    deliveredLinks: { type: [String], default: [] },

    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: null },
    paymentStatus: { type: String, enum: ["Not Invoiced", "Invoiced", "Paid"], default: "Not Invoiced" },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
