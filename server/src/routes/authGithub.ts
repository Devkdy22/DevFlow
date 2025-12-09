import express from "express";
import {
  initiateGitHubAuth,
  handleGitHubCallback,
} from "../controllers/githubAuthController";

const router = express.Router();

console.log("✅ GitHub 라우터 로드됨");

// 라우터 레벨 로깅
router.use((req, res, next) => {
  console.log("🔵 GitHub 라우터 진입");
  console.log("Path:", req.path);
  console.log("Base URL:", req.baseUrl);
  console.log("Original URL:", req.originalUrl);
  console.log("Method:", req.method);
  console.log("Query:", req.query);
  next();
});

// router.get("/", initiateGitHubAuth);
// router.get("/callback", handleGitHubCallback);

router.get(
  "/",
  (req, res, next) => {
    console.log("🟢 GET / 라우트 매칭됨");
    next();
  },
  initiateGitHubAuth
);

router.get(
  "/callback",
  (req, res, next) => {
    console.log("🟢 GET /callback 라우트 매칭됨");
    next();
  },
  handleGitHubCallback
);

export default router;
