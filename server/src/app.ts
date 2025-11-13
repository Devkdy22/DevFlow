import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";
import retroRoutes from "./routes/retroRoutes";
import taskRoutes from "./routes/taskRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 기본 라우트
app.get("/", (_, res) => res.send("✅ DevFlow API is running"));
// 인증 라우트
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/retros", retroRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/schedules", scheduleRoutes);

export default app;
