import mongoose from "mongoose";
import dotenv from "dotenv";
import Quality from "./src/models/Quality.js";
import Deadline from "./src/models/Deadline.js";

dotenv.config();

// Service/Task Quality scale used on the Evaluation form.
const qualityScale = [
  { type: "Below Average", rating: 1 },
  { type: "Average", rating: 2 },
  { type: "Good", rating: 3 },
  { type: "Better", rating: 4 },
  { type: "Best", rating: 5 },
];

// Deadline scale used on the Evaluation form.
const deadlineScale = [
  { type: "Very late", rating: 1 },
  { type: "Late", rating: 2 },
  { type: "On time", rating: 3 },
  { type: "Before time", rating: 4 },
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

    console.log("Connected to MongoDB for seeding evaluation scales...");

    for (const q of qualityScale) {
      await Quality.findOneAndUpdate(
        { type: q.type },
        { $set: { type: q.type, rating: q.rating, status: "Active" } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`Upserted ${qualityScale.length} quality ratings.`);

    for (const d of deadlineScale) {
      await Deadline.findOneAndUpdate(
        { name: d.type },
        { $set: { name: d.type, rating: d.rating, status: "Active" } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`Upserted ${deadlineScale.length} deadline ratings.`);

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
