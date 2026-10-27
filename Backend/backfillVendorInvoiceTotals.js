// One-time repair: before the fix in src/VMS/routes/vendorInvoiceRoutes.js,
// approving / rejecting / paying an invoice through the generic PUT recomputed
// totals from a body that had no line items, so the stored subtotal, GST and
// total were reset to 0. This recomputes them from the invoice's own
// particulars, using the same computeTotals() as the live routes, for every
// invoice whose stored total is 0 while its line items add up to more.
//
// Usage: node backfillVendorInvoiceTotals.js          (dry run — prints only)
//        node backfillVendorInvoiceTotals.js --apply  (writes the fixes)
import "dotenv/config";
import mongoose from "mongoose";
import VendorInvoice from "./src/VMS/models/VendorInvoice.js";
import { computeTotals } from "./src/VMS/routes/vendorInvoiceRoutes.js";

const apply = process.argv.includes("--apply");

const run = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in Backend/.env");
  }

  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "sadminperfectras",
  });

  const candidates = await VendorInvoice.find({ total: 0, "particulars.0": { $exists: true } });
  let fixed = 0;

  for (const invoice of candidates) {
    const totals = computeTotals(invoice.toObject());
    if (totals.total <= 0) continue;

    console.log(
      `${invoice.invoiceNo} (${invoice.status}): total 0 -> ${totals.total.toFixed(2)}` +
        ` (subtotal ${totals.subtotal.toFixed(2)}, GST ${totals.gstAmount.toFixed(2)})`
    );
    if (apply) {
      await VendorInvoice.updateOne({ _id: invoice._id }, totals);
    }
    fixed += 1;
  }

  console.log(
    apply
      ? `Updated ${fixed} invoice(s).`
      : `${fixed} invoice(s) would be updated. Re-run with --apply to write.`
  );
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
