import express from "express";
import Invoice from "../models/Invoice.js";
import Client from "../models/Client.js";
import { isSameState, calcGst } from "../utils/gst.js";

const router = express.Router();

const OBJECT_ID_FIELDS = ["client", "project"];

function sanitizeInvoiceBody(body) {
  const data = { ...body };
  for (const field of OBJECT_ID_FIELDS) {
    if (data[field] === "" || data[field] == null) {
      delete data[field];
    }
  }
  return data;
}

// Totals are always recomputed here from the line items, so a stale or tampered
// client can't save the wrong tax head: same-state client -> CGST + SGST,
// anyone else -> IGST (see utils/gst.js). `existing` fills in fields a partial
// update leaves out. Status-only updates (no items) keep the stored totals.
async function applyGstSplit(data, existing = {}) {
  if (!Array.isArray(data.items)) return data;
  const merged = { ...existing, ...data };

  let client = null;
  if (merged.client) {
    client = await Client.findById(merged.client).select("state gstIn country").lean();
  }

  const sameState = isSameState({
    supplierGstin: merged.fromGSTIN,
    gstin: merged.billToGSTIN || client?.gstIn,
    state: client?.state,
    country: client?.country,
  });

  const subtotal = data.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const gst = calcGst(subtotal, merged, sameState);

  return {
    ...data,
    subtotal,
    cgstAmount: gst.cgstAmount,
    sgstAmount: gst.sgstAmount,
    igstAmount: gst.igstAmount,
    totalAmount: subtotal + gst.taxAmount,
  };
}

// Get next invoice number (for frontend preview)
router.get("/next-number", async (_req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const count = await Invoice.countDocuments();
    const nextNumber = `${year}-${month}-${String(count + 1).padStart(3, "0")}`;
    res.json({ invoiceNumber: nextNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all invoices
router.get("/", async (_req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("client", "name email phone address state currency gstIn")
      .populate("project", "projectName projectCode projectId")
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single invoice
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("client", "name email phone address state currency gstIn")
      .populate("project", "projectName projectCode projectId");
    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create invoice
router.post("/", async (req, res) => {
  try {
    const invoice = new Invoice(await applyGstSplit(sanitizeInvoiceBody(req.body)));
    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update invoice
router.put("/:id", async (req, res) => {
  try {
    const body = sanitizeInvoiceBody(req.body);
    const existing = Array.isArray(body.items)
      ? await Invoice.findById(req.params.id).lean()
      : null;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      await applyGstSplit(body, existing || {}),
      { new: true, runValidators: true }
    );
    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete invoice
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
