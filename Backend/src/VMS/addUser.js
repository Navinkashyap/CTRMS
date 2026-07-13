import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import VMSUser from "./models/VMSUser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const addUser = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://piyush_db_user:navin123@cluster0.iapkvik.mongodb.net/?appName=Cluster0";
    
    await mongoose.connect(MONGODB_URI, {
      dbName: "sadminperfectras",
    });

    console.log("Connected to MongoDB...");

    // Check if user already exists
    const existing = await VMSUser.findOne({ email: "navin@admin.com" });
    if (existing) {
      console.log("User navin@admin.com already exists, updating password...");
      existing.password = "123456";
      await existing.save();
      console.log("✅ Password updated!");
    } else {
      const user = new VMSUser({
        name: "Navin Devolyt",
        email: "navin@admin.com",
        password: "123456",
        role: "vendor_manager",
      });
      await user.save();
      console.log("✅ User created: navin@admin.com / 123456 (vendor_manager)");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
};

addUser();
