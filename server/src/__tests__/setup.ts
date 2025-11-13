import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// 절대 경로로 .env.test를 로드
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

beforeAll(async () => {
  try {
    console.log("🔗 Connecting to:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ MongoDB Connected. State:", mongoose.connection.readyState);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      console.log("🧹 Dropping test database...");
      await mongoose.connection.db.dropDatabase();
      console.log("✅ Test DB dropped successfully");
    } else {
      console.warn("⚠️ No active DB connection to drop.");
    }
  } catch (error) {
    console.error("❌ Failed to drop test database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
});
