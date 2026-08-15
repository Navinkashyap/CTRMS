// One-time backfill: refreshes VMSProject "Incoming" records that were
// created before the mirror payload carried tool/PO/CPC/contact/amount/GST/
// task detail. Re-runs the same buildVmsPayload() used by the live sync path
// (src/routes/projectRoutes.js) against each pending incoming project's
// original admin Project record, and updates it in place — leaving newly
// synced projects and anything the PM has already accepted/rejected alone.
//
// Usage: node backfillIncomingVmsProjects.js
import "dotenv/config";
import mongoose from "mongoose";
import Project from "./src/models/Project.js";
import VMSProject from "./src/VMS/models/VMSProject.js";
import { buildVmsPayload } from "./src/routes/projectRoutes.js";

// buildVmsPayload's .populate() calls need these models registered on the
// default mongoose connection even though the script never references them
// directly — importing for the registration side effect only.
import "./src/models/Client.js";
import "./src/models/Contact.js";
import "./src/models/Service.js";
import "./src/models/Language.js";

const run = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in Backend/.env");
  }

  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "sadminperfectras",
  });
  console.log("Connected to MongoDB for backfill...");

  const incoming = await VMSProject.find({ status: "Incoming" });
  console.log(`Found ${incoming.length} pending incoming project(s).`);

  let updated = 0;
  let skipped = 0;

  for (const vmsProject of incoming) {
    const project = await Project.findOne({ projectId: vmsProject.projectId });
    if (!project) {
      console.warn(`  Skip ${vmsProject.projectId}: no matching admin Project found.`);
      skipped++;
      continue;
    }

    const payload = await buildVmsPayload(project._id);
    if (!payload) {
      console.warn(`  Skip ${vmsProject.projectId}: buildVmsPayload returned nothing.`);
      skipped++;
      continue;
    }

    await VMSProject.updateOne({ _id: vmsProject._id }, { $set: payload });
    console.log(`  Updated ${vmsProject.projectId}`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
