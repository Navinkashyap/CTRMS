// One-off script to create a Sales Manager account directly in the DB.
// Usage: node seedSalesManager.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";
import Admin from "./src/models/Admin.js";

dotenv.config();

const randomMobile = () => "9" + crypto.randomInt(100000000, 999999999).toString();

const randomPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars[crypto.randomInt(0, chars.length)];
  }
  return pwd;
};

const seedSalesManager = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in Backend/.env");
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || "sadminperfectras",
    });
    console.log("Connected to MongoDB.");

    const name = "Rahul Sharma";
    const email = "rahul.sharma@perfecttrans.com";
    const mobile = randomMobile();
    const password = randomPassword();
    const dob = new Date("1995-06-15");
    const gender = "Male";

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`Sales Manager ${email} already exists. Skipping.`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      await Admin.create({
        name,
        email,
        password: hashedPassword,
        mobile,
        dob,
        gender,
        role: "sales_manager",
        status: "Active",
        // Default permissions: full access to Clients/Contacts/Projects.
      });

      console.log("\nSales Manager created successfully:");
      console.log(`  Name:     ${name}`);
      console.log(`  Email:    ${email}`);
      console.log(`  Mobile:   ${mobile}`);
      console.log(`  Password: ${password}`);
      console.log(`  DOB:      1995-06-15`);
      console.log(`  Gender:   ${gender}`);
      console.log("\nThey can log in with Mobile Number + Password.");
      console.log("Ask them to change the password after first login.");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error seeding Sales Manager:", error);
    process.exit(1);
  }
};

seedSalesManager();
