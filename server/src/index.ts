import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI as string;

app.use(cors());
app.use(express.json());

// 기본 라우트 (테스트용)
app.get("/", (req, res) => {
  res.send("✅ DevFlow Backend is running!");
});

// MongoDB 연결
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
