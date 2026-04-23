import mongoose from "mongoose";
import dotenv from "dotenv";
import Vendor from "./src/models/Vendor.js";

dotenv.config();

const initialVendors = [
  { code: '2', name: 'Diwakar Mani', email: 'diwakarmani@gmail.com', country: 'India', motherTongue: 'HIN', ptft: 'PT', availability: 'Part Time', serviceQuality: 4, taskQuality: 4, timelyDelivery: 4 },
  { code: '1134', name: 'YVONE HABON', email: 'yvez22.lh@gmail.com', country: 'Philippines', motherTongue: 'ILO', ptft: 'FT', availability: 'Full Time', serviceQuality: 5, taskQuality: 5, timelyDelivery: 5 },
  { code: '5', name: 'Diptirekha Das', email: 'sibtmail@yahoo.com', country: 'India', motherTongue: 'ASM', ptft: 'PT', availability: 'Part Time', serviceQuality: 3, taskQuality: 3, timelyDelivery: 3 },
  { code: '6', name: 'Nasim Zaman', email: 'zamansn@gmail.com', country: 'India', motherTongue: 'ASM', ptft: 'FT', availability: 'Full Time', serviceQuality: 4, taskQuality: 4, timelyDelivery: 4 },
  { code: '874', name: 'Test Test', email: 'nextbraveheart@gmail.com', country: 'India', motherTongue: 'HIN', ptft: 'FT', availability: 'Full Time', serviceQuality: 2, taskQuality: 2, timelyDelivery: 2 },
];

const seedDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in Backend/.env");
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || "sadminperfectras",
    });

    console.log("Connected to MongoDB for seeding...");

    // Clear existing vendors
    await Vendor.deleteMany({});
    console.log("Cleared existing vendors.");

    // Insert initial vendors
    await Vendor.insertMany(initialVendors);
    console.log("Inserted initial vendors.");

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
