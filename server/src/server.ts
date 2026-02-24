import app from "./app";
import { connectDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI as string;

console.log("MONGODB_URI configured:", Boolean(MONGODB_URI));

const startServer = async () => {
  try {
    if (!MONGODB_URI) {
      console.error("❌ MONGODB_URI is missing");
      process.exit(1);
    }
    await connectDB(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      "❌ Failed to start server due to DB connection error:",
      error
    );
    process.exit(1); // DB 연결 실패 시 프로세스 종료
  }
};

startServer();
