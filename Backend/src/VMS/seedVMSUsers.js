import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import VMSUser from "./models/VMSUser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const testUsers = [
  {
    name: "Vendor Manager",
    email: "vm@perfectrans.com",
    password: "vm123",
    role: "vendor_manager",
  },
  {
    name: "Project Manager",
    email: "pm@perfectrans.com",
    password: "pm123",
    role: "project_manager",
  },
];

const seedVMSUsers = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in Backend/.env");
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || "sadminperfectras",
    });

    console.log("Connected to MongoDB for VMS user seeding...");

    // Clear existing VMS users
    await VMSUser.deleteMany({});
    console.log("Cleared existing VMS users.");

    // Create users one by one (so pre-save hook hashes passwords)
    for (const userData of testUsers) {
      const user = new VMSUser(userData);
      await user.save();
      console.log(`Created ${userData.role}: ${userData.email}`);
    }

    console.log("\n✅ VMS User seeding completed!");
    console.log("─────────────────────────────────");
    console.log("Test Credentials:");
    console.log("  Vendor Manager: vm@perfectrans.com / vm123");
    console.log("  Project Manager: pm@perfectrans.com / pm123");
    console.log("─────────────────────────────────");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedVMSUsers();
