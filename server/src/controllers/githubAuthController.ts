import { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User";

/**
 * ENV
 */
const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL = "http://localhost:5050/api/auth/github/callback",
  JWT_SECRET = "defaultsecret",
  FRONT_URL = "http://localhost:5173",
} = process.env;

/**
 * 필수 ENV 체크
 */
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.warn(
    "Warning: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is not set. GitHub OAuth will fail."
  );
}

/**
 * Utils
 */
const generateToken = (id: string, email: string) => {
  return jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: "7d" });
};

const generateState = () => crypto.randomBytes(16).toString("hex");

type StateData = {
  mode: "login" | "signup" | "link";
  expiresAt: number;
};

const stateStore = new Map<string, StateData>();

const saveState = (state: string, mode: StateData["mode"]) => {
  stateStore.set(state, {
    mode,
    expiresAt: Date.now() + 1000 * 60 * 5, // 5분
  });
};

const verifyState = (state: string): StateData | null => {
  const data = stateStore.get(state);
  if (!data || data.expiresAt < Date.now()) {
    stateStore.delete(state);
    return null;
  }
  stateStore.delete(state);
  return data;
};

/**
 * GitHub API client
 */
const githubAPI = axios.create({
  baseURL: "https://api.github.com",
  headers: { Accept: "application/vnd.github+json" },
});

const getGithubAccessToken = async (code: string) => {
  const { data } = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_CALLBACK_URL,
    },
    { headers: { Accept: "application/json" } }
  );
  return data.access_token || null;
};

const getGithubProfile = async (token: string) => {
  const { data } = await githubAPI.get("/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const getGithubEmail = async (token: string) => {
  const { data } = await githubAPI.get("/user/emails", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!Array.isArray(data)) return null;

  const primary = data.find((e: any) => e.primary && e.verified);
  const verified = data.find((e: any) => e.verified);
  return primary?.email || verified?.email || null;
};

/**
 * Helper: safe redirect to frontend with query params
 */
const redirectToFrontend = (
  res: Response,
  path: string,
  params?: Record<string, string | boolean>
) => {
  const url = new URL(path, FRONT_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
  }
  return res.redirect(url.toString());
};

/**
 * 1️⃣ GitHub 로그인 시작
 * GET /api/auth/git?mode=login|signup|link
 */
export const initiateGitHubAuth = async (req: Request, res: Response) => {
  console.log("🚀 === initiateGitHubAuth 실행 시작 ===");
  console.log("받은 Query:", JSON.stringify(req.query, null, 2));
  console.log("Mode 파라미터:", req.query.mode);
  console.log("GITHUB_CLIENT_ID 존재:", !!GITHUB_CLIENT_ID);
  console.log("GITHUB_CALLBACK_URL:", GITHUB_CALLBACK_URL);

  console.log("GitHub 인증 시작:", req.query);

  try {
    if (!GITHUB_CLIENT_ID) {
      console.error("❌ GitHub Client ID missing");
      return redirectToFrontend(res, "/login", { error: "github_config" });
    }

    const mode = (req.query.mode as StateData["mode"]) || "login";
    const state = generateState();
    saveState(state, mode);

    console.log("🔑 State 생성:", { state, mode });

    const authURL =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(GITHUB_CALLBACK_URL)}` +
      `&scope=${encodeURIComponent("user:email")}` +
      `&state=${encodeURIComponent(state)}`;

    console.log("✅ GitHub 인증 URL 생성 완료");
    return res.redirect(authURL);
  } catch (error) {
    console.error("❌ GitHub 인증 시작 실패:", error);
    return redirectToFrontend(res, "/login", { error: "server" });
  }
};

/**
 * 2️⃣ GitHub 콜백 처리
 * GET /api/auth/git/callback?code=...&state=...
 */
export const handleGitHubCallback = async (req: Request, res: Response) => {
  console.log("GitHub 콜백 처리:", req.query);

  try {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;

    if (!code || !state) {
      console.warn("⚠️ GitHub callback missing code or state");
      return redirectToFrontend(res, "/login", { error: "invalid" });
    }

    const stateData = verifyState(state);
    if (!stateData) {
      console.warn("⚠️ GitHub callback invalid/expired state:", state);
      return redirectToFrontend(res, "/login", { error: "state_expired" });
    }

    console.log("🔍 State 검증 완료:", stateData);

    const accessToken = await getGithubAccessToken(code);
    if (!accessToken) {
      console.warn("⚠️ GitHub access token not obtained");
      return redirectToFrontend(res, "/login", { error: "access_token" });
    }

    console.log("✅ GitHub 액세스 토큰 획득");

    const profile = await getGithubProfile(accessToken);
    const email = await getGithubEmail(accessToken);

    const githubId = String(profile?.id);
    const name = profile?.name || profile?.login || "GitHubUser";

    console.log("👤 GitHub 프로필:", { githubId, name, email });

    // 1) githubId로 기존 사용자 찾기
    let user = await User.findOne({ githubId });
    if (user) {
      console.log("✅ 기존 GitHub 연동 계정 발견");
      const token = generateToken(String(user._id), user.email);
      return redirectToFrontend(res, "/github/success", { token });
    }

    // 2) 이메일로 계정 검색 및 연결
    if (email) {
      const existing = await User.findOne({ email });
      if (existing) {
        if (stateData.mode === "signup") {
          console.log("⚠️ 이미 존재하는 이메일 (회원가입 모드)");
          return redirectToFrontend(res, "/github/link", {
            email: encodeURIComponent(email),
          });
        }

        // 로그인 모드: githubId가 없으면 연결 후 로그인
        if (!existing.githubId) {
          existing.githubId = githubId;
          await existing.save();
          console.log("✅ 기존 계정에 GitHub 연동 완료");
        }
        const token = generateToken(String(existing._id), existing.email);
        return redirectToFrontend(res, "/github/success", { token });
      }
    }

    // 3) 신규 사용자 생성 (signup 모드만 허용)
    if (stateData.mode === "login") {
      console.log("⚠️ 로그인 모드이지만 계정이 없음");
      return redirectToFrontend(res, "/login", { error: "not_found" });
    }

    if (!email) {
      console.warn("⚠️ GitHub 이메일 없음");
      return redirectToFrontend(res, "/login", { error: "no_email" });
    }

    // 랜덤 비밀번호 해시
    const dummyPwd = await bcrypt.hash(
      crypto.randomBytes(20).toString("hex"),
      12
    );

    const newUser = await User.create({
      name,
      email,
      githubId,
      password: dummyPwd,
      provider: "github",
    });

    console.log("✅ 신규 GitHub 사용자 생성 완료");

    const token = generateToken(String(newUser._id), newUser.email);

    return redirectToFrontend(res, "/github/success", { token, new: "true" });
  } catch (error) {
    console.error("❌ GitHub OAuth 실패:", error);
    return redirectToFrontend(res, "/login", { error: "server" });
  }
};
