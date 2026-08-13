import express from "express";
import VendorInvoice from "../models/VendorInvoice.js";
import Job from "../../models/Job.js";
import vmsAuth from "../middleware/vmsAuth.js";

const router = express.Router();
router.use(vmsAuth);

function computeTotals(body) {
  const particulars = Array.isArray(body.particulars) ? body.particulars : [];
  const subtotal = particulars.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const gstAmount = body.applyGst !== false ? subtotal * 0.18 : 0;
  return { subtotal, gstAmount, total: subtotal + gstAmount };
}

// Best-effort: mirror the invoice's link/status onto the job it bills for so
// "Payment Status" on the vendor's job screen stops being a dead-end field.
async function syncJobInvoiceState(jobId, invoice) {
  if (!jobId) return;
  try {
    await Job.findByIdAndUpdate(jobId, {
      invoiceId: invoice._id,
      paymentStatus: invoice.status === "Paid" ? "Paid" : "Invoiced",
    });
  } catch (error) {
    console.error("Failed to sync job invoice state:", error.message);
  }
}

// GET /api/vms/vendor-invoices?vendorCode=
router.get("/", async (req, res, next) => {
  try {
    const { vendorCode } = req.query;
    const filter = {};
    if (vendorCode) filter.vendorCode = vendorCode;
    const invoices = await VendorInvoice.find(filter).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

// GET /api/vms/vendor-invoices/:id
router.get("/:id", async (req, res, next) => {
  try {
    const invoice = await VendorInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// POST /api/vms/vendor-invoices — vendor creates/saves an invoice, optionally
// tied to a completed job (body.job = Job _id).
router.post("/", async (req, res, next) => {
  try {
    const { job: jobId, ...body } = req.body;
    const totals = computeTotals(body);
    const invoice = await VendorInvoice.create({ ...body, ...totals, job: jobId || null });
    res.status(201).json(invoice);
    await syncJobInvoiceState(jobId, invoice);
  } catch (error) {
    next(error);
  }
});

// PUT /api/vms/vendor-invoices/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { job: jobId, ...body } = req.body;
    const totals = computeTotals(body);
    const invoice = await VendorInvoice.findByIdAndUpdate(
      req.params.id,
      { ...body, ...totals, ...(jobId !== undefined ? { job: jobId || null } : {}) },
      { new: true, runValidators: true }
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
    await syncJobInvoiceState(invoice.job, invoice);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vms/vendor-invoices/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const invoice = await VendorInvoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
