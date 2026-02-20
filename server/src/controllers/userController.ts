import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";

// 내 정보 조회
export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "인증이 필요합니다." });
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "내 정보 조회 실패", error });
  }
};

// 이름 변경
export const updateName = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "인증이 필요합니다." });
    const { name } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select("-password");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "이름 수정 실패", error });
  }
};

// 비밀번호 변경
export const updatePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "인증이 필요합니다." });
    const { password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashed });
    res.json({ message: "비밀번호 변경 완료" });
  } catch (error) {
    res.status(500).json({ message: "비밀번호 변경 실패", error });
  }
};

// 회원 탈퇴
export const deleteMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "인증이 필요합니다." });
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "회원 탈퇴 완료" });
  } catch (error) {
    res.status(500).json({ message: "회원 탈퇴 실패", error });
  }
};
