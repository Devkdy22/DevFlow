import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";
import retroRoutes from "./routes/retroRoutes";
import taskRoutes from "./routes/taskRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import githubAuthRoutes from "./routes/authGithub";

dotenv.config();
const app = express();
const configuredOrigins = (process.env.FRONTEND_URL ?? "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
const allowedOrigins = [
  "http://localhost:5173",
  ...configuredOrigins,
];

// 모든 origin 허용 + 프리플라이트 처리
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
// app.use(cors());
app.use(express.json());

// 🔍 모든 요청 로깅 미들웨어 추가
app.use((req, res, next) => {
  console.log("======================");
  console.log("📍 요청:", req.method, req.originalUrl);
  console.log("Query:", req.query);
  console.log("Body:", req.body);
  console.log("======================");
  next();
});

// 기본 라우트
app.get("/", (_, res) => res.send("✅ DevFlow API is running"));
// 인증 라우트
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/retros", retroRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/auth/github", githubAuthRoutes);

export default app;
