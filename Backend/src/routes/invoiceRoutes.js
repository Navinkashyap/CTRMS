import express from "express";
import Invoice from "../models/Invoice.js";

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
  const invoice = new Invoice(sanitizeInvoiceBody(req.body));
  try {
    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update invoice
router.put("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      sanitizeInvoiceBody(req.body),
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
