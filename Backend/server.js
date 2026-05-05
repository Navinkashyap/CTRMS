import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import clientRoutes from "./src/routes/clientRoutes.js";
import vendorRoutes from "./src/routes/vendorRoutes.js";
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: "*",
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

  return res.status(500).json({
    message: err.message || "Internal server error",
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
