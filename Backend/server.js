import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import clientRoutes from "./src/routes/clientRoutes.js";
import vendorRoutes from "./src/routes/vendorRoutes.js";

dotenv.config();

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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

app.use("/api/clients", clientRoutes);
app.use("/api/vendors", vendorRoutes);

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
