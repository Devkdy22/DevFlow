import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import Schedule from "../models/Schedule";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is required.");
  process.exit(1);
}

const run = async () => {
  try {
    await connectDB(MONGODB_URI);

    const result = await Schedule.updateMany(
      { $or: [{ category: { $exists: false } }, { category: "" }] },
      { $set: { category: "기타" } }
    );

    console.log(
      `✅ Schedules migrated. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
