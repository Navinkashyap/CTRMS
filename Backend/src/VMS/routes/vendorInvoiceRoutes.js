import express from "express";
import VendorInvoice from "../models/VendorInvoice.js";
import Job from "../../models/Job.js";
import vmsAuth from "../middleware/vmsAuth.js";
import { isAccountantRole } from "./vmsAccountsRoutes.js";

const router = express.Router();
router.use(vmsAuth);

// Fields set only by the Accounts actions in vmsAccountsRoutes.js (approve /
// reject / pay). They're dropped from every write on this generic route, so
// nobody — a vendor re-saving an invoice, or Accounts itself — can approve or
// pay an invoice here and skip the 45-day hold or the single-payment check.
const ACCOUNTING_FIELDS = [
  "approvedAt", "payoutDueDate", "approvedBy",
  "paidAt", "paidAmount", "paidVia", "paidBy", "paymentReference",
  "rejectedAt", "rejectedBy", "rejectionReason", "accountantNotes",
];
const EDITABLE_STATUSES = ["Pending", "Draft", "Unpaid", "Processing", "Overdue"];

function stripAccountingFields(body) {
  const clean = { ...body };
  ACCOUNTING_FIELDS.forEach((field) => delete clean[field]);
  return clean;
}

export function computeTotals(body) {
  const particulars = Array.isArray(body.particulars) ? body.particulars : [];
  const subtotal = particulars.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const gstAmount = body.applyGst !== false ? subtotal * 0.18 : 0;
  return { subtotal, gstAmount, total: subtotal + gstAmount };
}

// CVV must never reach the database, however it got into the request body.
function stripCvv(body) {
  if (!body.paymentDetails || typeof body.paymentDetails !== "object") return body;
  const { cvv, ...paymentDetails } = body.paymentDetails;
  return { ...body, paymentDetails };
}

// Best-effort: mirror the invoice's link/status onto the job it bills for so
// "Payment Status" on the vendor's job screen stops being a dead-end field.
async function syncJobInvoiceState(jobId, invoice) {
  if (!jobId) return;
  try {
    await Job.findByIdAndUpdate(jobId, {
      invoiceId: invoice.invoiceNo || invoice._id,
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
// tied to completed jobs (body.job = Job _id, body.jobs = array of Job _ids).
router.post("/", async (req, res, next) => {
  try {
    const { job: jobId, jobs: jobIds, ...rest } = req.body;
    const body = stripAccountingFields(stripCvv(rest));

    // Extract all candidate job IDs and POs to be invoiced
    const candidateJobIds = [
      ...(Array.isArray(jobIds) ? jobIds : (jobId ? [jobId] : [])),
      ...(Array.isArray(body.particulars) ? body.particulars.map((p) => p.jobId).filter(Boolean) : []),
    ].map((id) => String(id));

    const candidatePos = [
      ...(Array.isArray(body.particulars) ? body.particulars.map((p) => p.po).filter(Boolean) : []),
    ]
      .filter((po) => po && po !== "—")
      .map((po) => String(po).replace(/^PO#/i, "").trim());

    // Duplicate Prevention: Check if any candidate job or PO has already been invoiced
    if (candidateJobIds.length > 0 || candidatePos.length > 0) {
      const orJobConditions = [];
      if (candidateJobIds.length > 0) orJobConditions.push({ _id: { $in: candidateJobIds } });
      if (candidatePos.length > 0) orJobConditions.push({ po: { $in: candidatePos } });

      const existingJobs = await Job.find({ $or: orJobConditions });
      const alreadyInvoiced = existingJobs.find((j) => j.invoiceId);
      if (alreadyInvoiced) {
        return res.status(400).json({
          message: `Task with PO "${alreadyInvoiced.po || alreadyInvoiced._id}" has already been invoiced.`,
        });
      }

      const orInvoiceConditions = [];
      if (candidateJobIds.length > 0) {
        orInvoiceConditions.push(
          { job: { $in: candidateJobIds } },
          { jobs: { $in: candidateJobIds } },
          { "particulars.jobId": { $in: candidateJobIds } }
        );
      }
      if (candidatePos.length > 0) {
        orInvoiceConditions.push({ "particulars.po": { $in: candidatePos } });
      }

      if (orInvoiceConditions.length > 0) {
        const existingInvoice = await VendorInvoice.findOne({
          $or: orInvoiceConditions,
        });
        if (existingInvoice) {
          return res.status(400).json({
            message: `One or more selected tasks are already included in invoice ${existingInvoice.invoiceNo || existingInvoice._id}. Duplicate invoices cannot be created.`,
          });
        }
      }
    }

    const totals = computeTotals(body);
    // A new invoice always starts in review; decisions come from Accounts.
    const initialStatus = body.status === "Draft" ? "Draft" : "Pending";
    const invoice = await VendorInvoice.create({
      ...body,
      status: initialStatus,
      ...totals,
      job: jobId || null,
      jobs: Array.isArray(jobIds) ? jobIds : (jobId ? [jobId] : []),
    });
    res.status(201).json(invoice);
    if (jobId) await syncJobInvoiceState(jobId, invoice);
    if (Array.isArray(jobIds)) {
      for (const id of jobIds) {
        if (id && String(id) !== String(jobId)) {
          await syncJobInvoiceState(id, invoice);
        }
      }
    }
  } catch (error) {
    next(error);
  }
});

// PUT /api/vms/vendor-invoices/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { job: jobId, ...rest } = req.body;
    const isAccountant = isAccountantRole(req.vmsAuth?.role);
    let body = stripAccountingFields(stripCvv(rest));

    const current = await VendorInvoice.findById(req.params.id).select("status").lean();
    if (!current) return res.status(404).json({ message: "Invoice not found" });

    if (isAccountant) {
      // Accounts may correct details and add notes here, but status changes
      // go through the approve / reject / pay actions.
      delete body.status;
      if (rest.accountantNotes !== undefined) body.accountantNotes = rest.accountantNotes;
    } else {
      // Vendor edits: only while the invoice is still in review, or to fix
      // and resubmit a rejected one (which sends it back for review).
      if (!EDITABLE_STATUSES.includes(current.status) && current.status !== "Rejected") {
        return res.status(409).json({
          message: `This invoice is already ${current.status} and can no longer be edited. Contact Accounts.`,
        });
      }
      if (current.status === "Rejected") {
        body = { ...body, status: "Pending", rejectionReason: "", rejectedAt: null, rejectedBy: "" };
      } else if (!["Pending", "Draft"].includes(body.status)) {
        delete body.status;
      }
    }

    // Recompute only when line items are sent — a status-only update must not
    // reset the stored totals to 0.
    const totals = Array.isArray(body.particulars) ? computeTotals(body) : {};
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
    if (!isAccountantRole(req.vmsAuth?.role)) {
      const current = await VendorInvoice.findById(req.params.id).select("status").lean();
      if (current && ["Approved", "Paid"].includes(current.status)) {
        return res.status(409).json({ message: `A ${current.status} invoice cannot be deleted.` });
      }
    }
    const invoice = await VendorInvoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
