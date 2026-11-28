// One-time import of vendors from the legacy VMS (MySQL → xlsx export) into
// the Vendor and VendorTranslationService collections.
//
// Input is the JSON produced by the legacy transform step: an array of
// { legacy: {vendorId, userId}, vendor: {...}, vts: {...} } where vendor.code is
// the legacy vendor.id. Imported vendors get an empty password (legacy passwords
// were reversibly encrypted, not hashed) and keep their legacy entry date as
// createdAt.
//
// A vendor is skipped — never overwritten — when its code or email already
// exists in Vendor, or its code already exists in VendorTranslationService.
//
// Every inserted document carries legacyImport: { source: "legacy-vms", ... }
// (not part of the schema, so the app ignores it) so the import can be undone.
//
// Usage: node migrateLegacyVendors.js <legacy_vendors.json>          (dry run — reads only)
//        node migrateLegacyVendors.js <legacy_vendors.json> --apply  (inserts)
//        node migrateLegacyVendors.js --rollback                     (counts imported docs)
//        node migrateLegacyVendors.js --rollback --apply             (deletes imported docs)
//        node migrateLegacyVendors.js --temp-password=<pw> [--apply] (sets <pw> on imported vendors whose password is blank)
import "dotenv/config";
import fs from "fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Vendor from "./src/models/Vendor.js";
import VendorTranslationService from "./src/models/VendorTranslationService.js";
import Language from "./src/models/Language.js";
import Tool from "./src/models/Tool.js";
import Specialization from "./src/models/Specialization.js";
import MotherTongue from "./src/models/MotherTongue.js";

const apply = process.argv.includes("--apply");
const rollback = process.argv.includes("--rollback");
const tempPassword = process.argv.find((a) => a.startsWith("--temp-password="))?.split("=").slice(1).join("=");
const inputPath = process.argv.slice(2).find((a) => !a.startsWith("--"));
const SOURCE = "legacy-vms";

const lower = (s) => String(s || "").trim().toLowerCase();

// Values the legacy data uses that are missing from a master collection.
const missingFrom = async (Model, values) => {
  const known = new Set((await Model.find().select("name").lean()).map((d) => lower(d.name)));
  const missing = new Map();
  for (const v of values) {
    if (v && v !== "N/A" && !known.has(lower(v))) missing.set(v, (missing.get(v) || 0) + 1);
  }
  return [...missing.entries()].sort((a, b) => b[1] - a[1]);
};

// Run the documents through the Mongoose schemas (casting, defaults, enums,
// required fields) and return plain objects ready for a raw insert, so the
// legacy createdAt/updatedAt are kept instead of being reset to now.
const toInsertable = (Model, doc, legacy) => {
  const instance = new Model(doc);
  const err = instance.validateSync();
  if (err) return { error: Object.values(err.errors).map((e) => e.message).join("; ") };
  const obj = instance.toObject({ depopulate: true });
  obj.createdAt = new Date(doc.createdAt);
  obj.updatedAt = new Date(doc.updatedAt);
  obj.legacyImport = { source: SOURCE, ...legacy, importedAt: new Date() };
  return { obj };
};

const runRollback = async () => {
  const filter = { "legacyImport.source": SOURCE };
  const counts = [await Vendor.collection.countDocuments(filter), await VendorTranslationService.collection.countDocuments(filter)];
  console.log(`Imported docs found — Vendor: ${counts[0]}, VendorTranslationService: ${counts[1]}`);
  if (!apply) return console.log("Dry run only — re-run with --rollback --apply to delete them.");
  const v = await Vendor.collection.deleteMany(filter);
  const s = await VendorTranslationService.collection.deleteMany(filter);
  console.log(`Deleted — Vendor: ${v.deletedCount}, VendorTranslationService: ${s.deletedCount}`);
};

// Hash per document with its own salt, exactly like the Vendor pre-save hook.
const runTempPassword = async () => {
  if (tempPassword.length < 6) throw new Error("Temp password must be at least 6 characters");
  const filter = { "legacyImport.source": SOURCE, password: "" };
  const targets = await Vendor.collection.find(filter).project({ _id: 1 }).toArray();
  console.log(`Imported vendors with a blank password: ${targets.length}`);
  if (!apply) return console.log("Dry run only — re-run with --apply to set the password.");
  const now = new Date();
  const ops = [];
  for (const { _id } of targets) {
    const hash = await bcrypt.hash(tempPassword, await bcrypt.genSalt(10));
    ops.push({ updateOne: { filter: { _id, password: "" }, update: { $set: { password: hash, "legacyImport.tempPasswordSetAt": now } } } });
  }
  const res = ops.length ? await Vendor.collection.bulkWrite(ops, { ordered: false }) : { modifiedCount: 0 };
  console.log(`Password set on ${res.modifiedCount} vendors`);
};

const run = async () => {
  if (!inputPath && !rollback && !tempPassword) throw new Error("Usage: node migrateLegacyVendors.js <legacy_vendors.json> [--apply] | --rollback [--apply] | --temp-password=<pw> [--apply]");
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing in Backend/.env");

  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || "sadminperfectras" });
  console.log(`Connected to "${mongoose.connection.name}". Mode: ${rollback ? "ROLLBACK " : ""}${apply ? "APPLY" : "DRY RUN"}`);
  if (rollback) return runRollback();
  if (tempPassword) return runTempPassword();

  const records = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  const existingVendors = await Vendor.find().select("code email").lean();
  const codes = new Set(existingVendors.map((v) => v.code));
  const emails = new Set(existingVendors.map((v) => lower(v.email)));
  const vtsCodes = new Set((await VendorTranslationService.find().select("vendorCode").lean()).map((d) => d.vendorCode));
  console.log(`Existing: ${existingVendors.length} vendors, ${vtsCodes.size} translation-service docs`);

  const vendorDocs = [];
  const vtsDocs = [];
  const skipped = { codeExists: [], emailExists: [], vtsExists: [], invalid: [] };

  for (const { legacy, vendor, vts } of records) {
    if (codes.has(vendor.code)) { skipped.codeExists.push(vendor.code); continue; }
    if (emails.has(lower(vendor.email))) { skipped.emailExists.push(vendor.code); continue; }
    if (vtsCodes.has(vts.vendorCode)) { skipped.vtsExists.push(vendor.code); continue; }
    const v = toInsertable(Vendor, vendor, legacy);
    const s = toInsertable(VendorTranslationService, vts, legacy);
    if (v.error || s.error) {
      skipped.invalid.push({ code: vendor.code, error: v.error || s.error });
      continue;
    }
    vendorDocs.push(v.obj);
    vtsDocs.push(s.obj);
    codes.add(vendor.code);
    emails.add(lower(vendor.email));
  }

  const pairs = vtsDocs.flatMap((d) => d.languagePairs);
  console.log("\n── Plan ──");
  console.log(`Input records:            ${records.length}`);
  console.log(`Vendors to insert:        ${vendorDocs.length} (Approved: ${vendorDocs.filter((v) => v.approvalStatus === "Approved").length}, inactive: ${vendorDocs.filter((v) => !v.isActive).length})`);
  console.log(`Translation-service docs: ${vtsDocs.length} with ${pairs.length} language pairs`);
  console.log(`Skipped – code exists:    ${skipped.codeExists.length} ${skipped.codeExists.slice(0, 20).join(", ")}`);
  console.log(`Skipped – email exists:   ${skipped.emailExists.length} ${skipped.emailExists.slice(0, 20).join(", ")}`);
  console.log(`Skipped – VTS exists:     ${skipped.vtsExists.length} ${skipped.vtsExists.slice(0, 20).join(", ")}`);
  console.log(`Skipped – invalid:        ${skipped.invalid.length}`);
  skipped.invalid.slice(0, 10).forEach((x) => console.log(`   ${x.code}: ${x.error}`));

  console.log("\n── Legacy values not in master collections (dropdowns may not pre-select these) ──");
  const report = async (label, Model, values) => {
    const missing = await missingFrom(Model, values);
    console.log(`${label}: ${missing.length} missing${missing.length ? " → " + missing.slice(0, 25).map(([n, c]) => `${n} (${c})`).join(", ") : ""}`);
  };
  await report("Languages", Language, pairs.flatMap((p) => [p.source, ...p.target]));
  await report("Tools", Tool, vtsDocs.flatMap((d) => d.tools));
  await report("Specializations", Specialization, vtsDocs.flatMap((d) => d.expertiseList));
  await report("Mother tongues", MotherTongue, vendorDocs.map((d) => d.motherTongue));

  if (!apply) {
    console.log("\nDry run only — nothing written. Re-run with --apply to insert.");
    return;
  }

  // Raw inserts keep the legacy timestamps. ordered:false so one bad document
  // doesn't stop the rest; failures are reported below.
  const insertAll = async (Model, docs) => {
    try {
      const res = await Model.collection.insertMany(docs, { ordered: false });
      return { inserted: res.insertedCount, errors: [] };
    } catch (err) {
      return { inserted: err.result?.insertedCount ?? 0, errors: err.writeErrors?.map((e) => e.errmsg) ?? [err.message] };
    }
  };
  const v = await insertAll(Vendor, vendorDocs);
  console.log(`\nVendor: inserted ${v.inserted}/${vendorDocs.length}`);
  v.errors.slice(0, 10).forEach((e) => console.log("   " + e));

  // Only create translation-service docs for vendors that actually made it in.
  const insertedCodes = new Set((await Vendor.find({ code: { $in: vendorDocs.map((d) => d.code) } }).select("code").lean()).map((d) => d.code));
  const s = await insertAll(VendorTranslationService, vtsDocs.filter((d) => insertedCodes.has(d.vendorCode)));
  console.log(`VendorTranslationService: inserted ${s.inserted}`);
  s.errors.slice(0, 10).forEach((e) => console.log("   " + e));
};

run()
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
