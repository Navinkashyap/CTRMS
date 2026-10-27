// Accounts & Finance portal routes — used by the screens under
// VMS/src/components/Accounts. Every route needs a VMS token belonging to an
// active accountant. Invoice decisions (approve / reject / pay) are dedicated
// endpoints with server-enforced transitions, rather than the generic
// PUT /api/vms/vendor-invoices/:id, so a payout can't skip approval or the
// 45-day hold, and two people can't pay the same invoice twice.
import express from "express";
import VendorInvoice from "../models/VendorInvoice.js";
import VMSUser from "../models/VMSUser.js";
import Job from "../../models/Job.js";
import vmsAuth from "../middleware/vmsAuth.js";

const router = express.Router();

export const PAYOUT_HOLD_DAYS = 45;
const DAY_MS = 24 * 60 * 60 * 1000;

export const isAccountantRole = (role) =>
  ["accountant", "accounts"].includes(String(role || "").toLowerCase());

// Every stored status the portal treats as "waiting for review".
const PENDING_STATUSES = ["Pending", "Draft", "Unpaid", "Processing", "Overdue"];
const STATUS_FILTERS = {
  Pending: { status: { $in: PENDING_STATUSES } },
  Approved: { status: "Approved" },
  Paid: { status: "Paid" },
  Rejected: { status: "Rejected" },
};

// Invoices approved before approvedAt was recorded fall back to updatedAt,
// matching getInvoiceMaturity() in the frontend.
const payoutDueDate = (invoice) => {
  if (invoice.payoutDueDate) return new Date(invoice.payoutDueDate);
  const approvedAt = invoice.approvedAt || invoice.updatedAt;
  return approvedAt ? new Date(new Date(approvedAt).getTime() + PAYOUT_HOLD_DAYS * DAY_MS) : null;
};

const isMatured = (invoice, now = new Date()) => {
  const due = payoutDueDate(invoice);
  return Boolean(due) && due <= now;
};

const actorName = (user) => user.name || user.email;

// Jobs an invoice bills for, from every place the vendor portal records them.
const linkedJobIds = (invoice) =>
  [
    ...new Set(
      [invoice.job, ...(invoice.jobs || []), ...(invoice.particulars || []).map((p) => p.jobId)]
        .filter(Boolean)
        .map(String)
    ),
  ].filter((id) => /^[a-f\d]{24}$/i.test(id));

const updateLinkedJobs = async (invoice, update) => {
  const ids = linkedJobIds(invoice);
  if (!ids.length) return;
  try {
    await Job.updateMany({ _id: { $in: ids } }, update);
  } catch (error) {
    console.error("Failed to sync jobs for invoice", invoice.invoiceNo, error.message);
  }
};

// Atomic status move: only succeeds if the invoice is still in one of `from`.
// Returns the updated invoice, or sends the right error and returns null.
const transition = async (req, res, from, update, action) => {
  const invoice = await VendorInvoice.findOneAndUpdate(
    { _id: req.params.id, status: { $in: from } },
    update,
    { new: true, runValidators: true }
  );
  if (invoice) return invoice;

  const current = await VendorInvoice.findById(req.params.id).select("status").lean();
  if (!current) res.status(404).json({ message: "Invoice not found" });
  else res.status(409).json({ message: `A ${current.status} invoice can't be ${action}. Refresh and try again.` });
  return null;
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  countryCode: user.countryCode,
  contactNo: user.contactNo,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

/* ------------------------------------------------------------------ */
/*  Auth: active accountant only                                        */
/* ------------------------------------------------------------------ */

router.use(vmsAuth, async (req, res, next) => {
  try {
    if (!isAccountantRole(req.vmsAuth?.role)) {
      return res.status(403).json({ message: "Only Accounts users can access this." });
    }
    // Re-read the account so a deactivated or deleted accountant loses
    // access immediately, not when their 7-day token runs out.
    const user = await VMSUser.findById(req.vmsAuth.id);
    if (!user || !isAccountantRole(user.role)) {
      return res.status(401).json({ message: "Account no longer exists" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }
    req.accountant = user;
    next();
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  Profile                                                             */
/* ------------------------------------------------------------------ */

router.get("/me", (req, res) => res.json(sanitizeUser(req.accountant)));

router.put("/me", async (req, res, next) => {
  try {
    const { name, countryCode, contactNo } = req.body;
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ message: "Name is required" });
      req.accountant.name = String(name).trim();
    }
    if (countryCode !== undefined) req.accountant.countryCode = String(countryCode).trim();
    if (contactNo !== undefined) {
      const digits = String(contactNo).replace(/\D/g, "");
      if (digits && (digits.length < 6 || digits.length > 15)) {
        return res.status(400).json({ message: "Enter a valid phone number (6–15 digits)" });
      }
      req.accountant.contactNo = digits;
    }
    await req.accountant.save();
    res.json(sanitizeUser(req.accountant));
  } catch (error) {
    next(error);
  }
});

router.put("/me/password", async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    if (!(await req.accountant.comparePassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from the current one" });
    }
    req.accountant.password = newPassword; // hashed by the model's pre-save hook
    await req.accountant.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  Dashboard summary                                                   */
/* ------------------------------------------------------------------ */

router.get("/summary", async (_req, res, next) => {
  try {
    const invoices = await VendorInvoice.find()
      .select("status total paidAmount approvedAt payoutDueDate updatedAt")
      .lean();

    const now = new Date();
    const counts = { all: invoices.length, pending: 0, approved: 0, matured: 0, paid: 0, rejected: 0 };
    const amounts = { pending: 0, approved: 0, matured: 0, paid: 0 };

    for (const inv of invoices) {
      const total = Number(inv.total) || 0;
      if (inv.status === "Approved") {
        counts.approved += 1;
        amounts.approved += total;
        if (isMatured(inv, now)) {
          counts.matured += 1;
          amounts.matured += total;
        }
      } else if (inv.status === "Paid") {
        counts.paid += 1;
        amounts.paid += Number(inv.paidAmount) || total;
      } else if (inv.status === "Rejected") {
        counts.rejected += 1;
      } else {
        counts.pending += 1;
        amounts.pending += total;
      }
    }

    res.json({ counts, amounts, holdDays: PAYOUT_HOLD_DAYS });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/*  Invoices                                                            */
/* ------------------------------------------------------------------ */

// GET /api/vms/accounts/invoices?status=All|Pending|Approved|Paid|Rejected
router.get("/invoices", async (req, res, next) => {
  try {
    const filter = STATUS_FILTERS[req.query.status] || {};
    const invoices = await VendorInvoice.find(filter).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

router.get("/invoices/:id", async (req, res, next) => {
  try {
    const invoice = await VendorInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

router.post("/invoices/:id/approve", async (req, res, next) => {
  try {
    const approvedAt = new Date();
    const invoice = await transition(req, res, PENDING_STATUSES, {
      status: "Approved",
      approvedAt,
      payoutDueDate: new Date(approvedAt.getTime() + PAYOUT_HOLD_DAYS * DAY_MS),
      approvedBy: actorName(req.accountant),
      rejectionReason: "",
      rejectedAt: null,
      rejectedBy: "",
    }, "approved");
    if (invoice) res.json(invoice);
  } catch (error) {
    next(error);
  }
});

router.post("/invoices/:id/reject", async (req, res, next) => {
  try {
    const reason = String(req.body.reason || "").trim();
    if (!reason) return res.status(400).json({ message: "A rejection reason is required" });

    const invoice = await transition(req, res, [...PENDING_STATUSES, "Approved"], {
      status: "Rejected",
      rejectionReason: reason,
      rejectedAt: new Date(),
      rejectedBy: actorName(req.accountant),
      approvedAt: null,
      payoutDueDate: null,
      approvedBy: "",
    }, "rejected");
    if (invoice) res.json(invoice);
  } catch (error) {
    next(error);
  }
});

router.post("/invoices/:id/pay", async (req, res, next) => {
  try {
    const paymentReference = String(req.body.paymentReference || "").trim();
    const paidAmount = Number(req.body.paidAmount);
    if (!paymentReference) {
      return res.status(400).json({ message: "Bank reference / UTR number is required" });
    }
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid paid amount" });
    }

    const existing = await VendorInvoice.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ message: "Invoice not found" });
    if (existing.status === "Approved" && !isMatured(existing)) {
      const due = payoutDueDate(existing);
      return res.status(409).json({
        message: `This invoice is in its ${PAYOUT_HOLD_DAYS}-day hold until ${due.toDateString()}.`,
      });
    }

    const invoice = await transition(req, res, ["Approved"], {
      status: "Paid",
      paymentReference,
      paidAmount,
      paidVia: String(req.body.paidVia || "").trim(),
      accountantNotes: String(req.body.notes || "").trim(),
      paidAt: new Date(),
      paidBy: actorName(req.accountant),
    }, "paid");
    if (!invoice) return;

    res.json(invoice);
    await updateLinkedJobs(invoice, { paymentStatus: "Paid" });
  } catch (error) {
    next(error);
  }
});

// Paid invoices are the payout record and stay. Deleting any other invoice
// frees its jobs so the vendor can invoice them again.
router.delete("/invoices/:id", async (req, res, next) => {
  try {
    const invoice = await VendorInvoice.findOneAndDelete({ _id: req.params.id, status: { $ne: "Paid" } });
    if (!invoice) {
      const exists = await VendorInvoice.exists({ _id: req.params.id });
      return exists
        ? res.status(409).json({ message: "Paid invoices cannot be deleted." })
        : res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted successfully" });
    await updateLinkedJobs(invoice, { invoiceId: null, paymentStatus: "Not Invoiced" });
  } catch (error) {
    next(error);
  }
});

export default router;
