import dotenv from "dotenv";
import mongoose from "mongoose";
import Task from "../models/Task";
import { connectDB } from "../config/db";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is required.");
  process.exit(1);
}

const mapStatus = (status: string) => {
  if (status === "할 일") return "todo";
  if (status === "진행 중") return "doing";
  if (status === "완료") return "done";
  return status;
};

const run = async () => {
  try {
    await connectDB(MONGODB_URI);

    const docs = await Task.find({
      status: { $in: ["할 일", "진행 중", "완료"] },
    }).select({ _id: 1, status: 1 });

    if (docs.length === 0) {
      console.log("✅ No legacy statuses found. Nothing to migrate.");
      return;
    }

    const bulk = docs.map(doc => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { status: mapStatus(String(doc.status)) } },
      },
    }));

    const result = await Task.bulkWrite(bulk);
    console.log(
      `✅ Migrated ${result.modifiedCount} task(s) to todo/doing/done.`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
