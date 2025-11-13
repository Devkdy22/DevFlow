import { Request, Response } from "express";
import Retro from "../models/Retro";

// 회고 생성
export const createRetro = async (req: Request, res: Response) => {
  try {
    const payload = { ...req.body, userId: (req as any).user?.id };
    const retro = new Retro(payload);
    await retro.save();
    res.status(201).json(retro);
  } catch (error) {
    console.error("retro create error:", error); // 디버깅 로그
    res.status(500).json({ message: "회고 생성 실패", error });
  }
};

// 프로젝트별 회고 조회
export const getRetrosByProject = async (req: Request, res: Response) => {
  try {
    const retros = await Retro.find({ projectId: req.params.projectId });
    res.json(retros);
  } catch (error) {
    res.status(500).json({ message: "회고 조회 실패", error });
  }
};

// 회고 수정
export const updateRetro = async (req: Request, res: Response) => {
  try {
    const updated = await Retro.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "회고 없음" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "회고 수정 실패", error });
  }
};

// 회고 삭제
export const deleteRetro = async (req: Request, res: Response) => {
  try {
    await Retro.findByIdAndDelete(req.params.id);
    res.json({ message: "회고 삭제 완료" });
  } catch (error) {
    res.status(500).json({ message: "회고 삭제 실패", error });
  }
};
