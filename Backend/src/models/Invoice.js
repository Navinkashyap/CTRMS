import mongoose from "mongoose";

const InvoiceItemSchema = new mongoose.Schema({
  sNo: { type: Number },
  particulars: { type: String, trim: true, default: "" },
  amount: { type: Number, default: 0 },
});

const InvoiceSchema = new mongoose.Schema(
  {
    // Invoice Header
    invoiceNumber: { type: String, unique: true },
    invoiceDate: { type: Date, default: Date.now },
    supplierNo: { type: String, trim: true, default: "N/A" },

    // From (Company Info) — defaults from Perfectrans
    fromCompany: {
      type: String,
      trim: true,
      default: "Convaq Technologies Pvt. Ltd.",
    },
    fromAddress: {
      type: String,
      trim: true,
      default: "B-11, Sector 65, Noida, IN 2001301",
    },
    fromPhone: { type: String, trim: true, default: "+91-120-4280-274" },
    fromEmail: {
      type: String,
      trim: true,
      default: "accounts@perfectrans.com",
    },
    fromWebsite: { type: String, trim: true, default: "www.perfectrans.com" },
    fromGSTIN: { type: String, trim: true, default: "09AAGCC0048P1ZD" },

    // Bill To (Client Info)
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    billToCompany: { type: String, trim: true, default: "" },
    billToAddress: { type: String, trim: true, default: "" },
    billToEmail: { type: String, trim: true, default: "" },
    billToPhone: { type: String, trim: true, default: "" },
    billToGSTIN: { type: String, trim: true, default: "" },

    // Line Items (up to 10 rows as shown in the format)
    items: [InvoiceItemSchema],

    // GST & Totals — same logic as Project model
    gstEnabled: { type: Boolean, default: false },
    cgstPercent: { type: Number, default: 9 },
    sgstPercent: { type: Number, default: 9 },
    igstPercent: { type: Number, default: 18 },
    subtotal: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, trim: true, default: "INR" },

    // Bank Info — defaults from Perfectrans
    bankGSTIN: { type: String, trim: true, default: "09AAGCC0048P1ZD" },
    sacCode: { type: String, trim: true, default: "00440153" },
    panNo: { type: String, trim: true, default: "AAGCC0048P" },
    accountHolderName: {
      type: String,
      trim: true,
      default: "CONVAQ TECHNOLOGIES PRIVATE LIMITED",
    },
    accountNumber: { type: String, trim: true, default: "000705041421" },
    bankName: { type: String, trim: true, default: "ICICI Bank" },
    branchAddress: {
      type: String,
      trim: true,
      default: "9A Phelps, Connaught Place, New Delhi-110001",
    },
    ifscCode: { type: String, trim: true, default: "ICIC0000007" },
    swiftCode: { type: String, trim: true, default: "ICICINBBCTS" },
    micrCode: { type: String, trim: true, default: "110229002" },
    accountType: { type: String, trim: true, default: "Current" },
    paypalEmail: {
      type: String,
      trim: true,
      default: "paypal@perfectrans.com",
    },
    payoneerEmail: { type: String, trim: true, default: "" },

    // Status & References
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue", "Draft"],
      default: "Pending",
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

// Auto-generate invoiceNumber: YYYY-MM-NNN
InvoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const count = await mongoose.model("Invoice").countDocuments();
    this.invoiceNumber = `${year}-${month}-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

export default mongoose.model("Invoice", InvoiceSchema);
