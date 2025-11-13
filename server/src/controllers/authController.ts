import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

// JWT 생성 함수
const generateToken = (id: string, email: string) => {
  // payload에서 userId 키를 사용하도록 변경 (authMiddleware와 일치)
  return jwt.sign(
    { userId: id, email },
    process.env.JWT_SECRET || "defaultsecret",
    {
      expiresIn: "7d",
    }
  );
};

// 회원가입
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, githubId } = req.body;
    console.log("registerUser request:", { name, email, githubId }); // debug

    const existingUser = await User.findOne({ email });
    console.log("existingUser:", existingUser); // debug

    if (existingUser)
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      githubId,
    });

    await newUser.save();

    // _id를 문자열로 전달
    const token = generateToken(String(newUser._id), newUser.email);

    res.status(201).json({
      message: "회원가입 완료",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        githubId: newUser.githubId,
      },
    });
  } catch (error) {
    console.error("auth register error:", error); // 추가
    res.status(500).json({ message: "회원가입 실패", error });
  }
};

// 로그인
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

    const token = generateToken(String(user._id), user.email);

    res.json({
      message: "로그인 성공",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        githubId: user.githubId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "로그인 실패", error });
  }
};
