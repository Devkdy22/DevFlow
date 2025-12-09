import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import {
  registerUser,
  loginUser,
  forgotPassword,
} from "../controllers/authController";
import { generateResetToken, sendResetEmail } from "../utils/authUtils";
import crypto from "crypto";

const router = express.Router();

// 회원가입
router.post("/register", async (req, res) => {
  console.log("회원가입 요청:", req.body);
  console.log("✅ register Mongo URI:", process.env.MONGODB_URI);
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    res.status(201).json({ message: "회원가입 완료", user });
  } catch (error) {
    res.status(500).json({ message: "회원가입 실패", error });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "7d" }
    );

    res.json({ message: "로그인 성공", token });
  } catch (error) {
    res.status(500).json({ message: "로그인 실패", error });
  }
});

router.post("/forgot-password", async (req, res) => {
  console.log("✅ password Mongo URI:", process.env.MONGODB_URI);
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "이메일 필요" });

    // 유저가 있는지 찾아보고, 있으면 토큰 저장 및 이메일 발송
    //const user = await User.findOne({ email: email.toLowerCase() });
    const user = await User.findOne({ email: email });
    console.log("🔍 비밀번호 재설정 유저 조회:", user, email);

    if (user) {
      const { token, tokenHash } = generateResetToken();
      const expiresInMin = Number(process.env.RESET_TOKEN_EXPIRES_MIN || 60);

      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = new Date(
        Date.now() + expiresInMin * 60 * 1000
      );
      await user.save();
      console.log("🔑 토큰 생성 및 DB 저장 완료");

      // 이메일 전송 (비동기) — 실패해도 사용자에게는 동일한 응답을 줄 수 있음
      try {
        await sendResetEmail(user.email, token);
        const emailResult = await sendResetEmail(user.email, token);
        console.log("📧 이메일 발송 결과:", emailResult);
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        // 필요 시 로깅만 하고 사용자에게는 일반 응답 유지
      }
    }

    // 보안: 이메일 존재 여부 노출 금지 — 항상 같은 응답
    return res.json({
      message: "비밀번호 재설정 메일을 보냈습니다. 메일을 확인하세요.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ message: "토큰과 비밀번호 필요" });

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "유효하지 않거나 만료된 토큰입니다." });
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 토큰 제거
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ message: "비밀번호가 변경되었습니다." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
