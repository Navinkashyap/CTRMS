import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import clientRoutes from "./src/routes/clientRoutes.js";
import vendorRoutes from "./src/routes/vendorRoutes.js";
import vendorTranslationServiceRoutes from "./src/routes/vendorTranslationServiceRoutes.js";
import projectManagerRoutes from "./src/routes/projectManagerRoutes.js";
import typeRoutes from "./src/routes/typeRoutes.js";
import membershipRoutes from "./src/routes/membershipRoutes.js";
import countryRoutes from "./src/routes/countryRoutes.js";
import stateRoutes from "./src/routes/stateRoutes.js";
import cityRoutes from "./src/routes/cityRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import toolRoutes from "./src/routes/toolRoutes.js";
import currencyRoutes from "./src/routes/currencyRoutes.js";
import languageRoutes from "./src/routes/languageRoutes.js";
import specializationRoutes from "./src/routes/specializationRoutes.js";
import qualityRoutes from "./src/routes/qualityRoutes.js";
import deadlineRoutes from "./src/routes/deadlineRoutes.js";
import departmentRoutes from "./src/routes/departmentRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import invoiceRoutes from "./src/routes/invoiceRoutes.js";
import unitRoutes from "./src/routes/unitRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import evaluationRoutes from "./src/routes/evaluationRoutes.js";
import vmsAuthRoutes from "./src/VMS/routes/vmsAuthRoutes.js";
import vmsUserRoutes from "./src/VMS/routes/vmsUserRoutes.js";
import vmsRoleRoutes from "./src/VMS/routes/vmsRoleRoutes.js";
import vmsPMRoutes from "./src/VMS/routes/vmsPMRoutes.js";
import vmsProjectRoutes from "./src/VMS/routes/vmsProjectRoutes.js";
import vmsVendorRoutes from "./src/VMS/routes/vmsVendorRoutes.js";
import vmsVMRoutes from "./src/VMS/routes/vmsVMRoutes.js";
import vendorInvoiceRoutes from "./src/VMS/routes/vendorInvoiceRoutes.js";
import jobRoutes from "./src/routes/jobRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// CLIENT_ORIGIN supports a comma-separated list, e.g.
// "https://admin.example.com,https://vms.example.com"
const allowedOrigins = CLIENT_ORIGIN.split(",").map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

app.use("/api/clients", clientRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/vendor-translation-services", vendorTranslationServiceRoutes);
app.use("/api/project-managers", projectManagerRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/specializations", specializationRoutes);
app.use("/api/qualities", qualityRoutes);
app.use("/api/deadlines", deadlineRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/jobs", jobRoutes);

// ─── VMS Routes ─────────────────────────────────────────────────────────────
app.use("/api/vms/auth", vmsAuthRoutes);
app.use("/api/vms/users", vmsUserRoutes);
app.use("/api/vms/roles", vmsRoleRoutes);
app.use("/api/vms/pm", vmsPMRoutes);
app.use("/api/vms/projects", vmsProjectRoutes);
app.use("/api/vms/vendor", vmsVendorRoutes);
app.use("/api/vms/vm", vmsVMRoutes);
app.use("/api/vms/vendor-invoices", vendorInvoiceRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  if (err?.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      message: `${duplicateField} already exists`,
    });
  }

  const isDev = process.env.NODE_ENV !== "production";
  return res.status(500).json({
    message: err.message || "Internal server error",
    ...(isDev ? { stack: err.stack } : {}),
  });
});

const startServer = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in Backend/.env");
  }

  // Monitor connection events
  mongoose.connection.on("connecting", () => console.log("Connecting to MongoDB..."));
  mongoose.connection.on("connected", () => console.log("MongoDB connected successfully"));
  mongoose.connection.on("error", (err) => console.error("MongoDB connection error:", err));
  mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected"));

  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "sadminperfectras",
  });

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
