import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./src/models/Admin.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in Backend/.env");
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || "sadminperfectras",
    });

    console.log("Connected to MongoDB.");

    const email = "piyush@perfectrans.com";
    const password = "Piyush@123";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin ${email} already exists. Skipping seeder.`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAdmin = new Admin({
        email,
        password: hashedPassword,
        role: "superadmin"
      });

      await newAdmin.save();
      console.log(`Successfully created super admin: ${email}`);
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
