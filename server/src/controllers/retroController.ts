import { Request, Response } from "express";
import Retro from "../models/Retro";
import mongoose from "mongoose";

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
    const projectId = new mongoose.Types.ObjectId(req.params.projectId);

    // const retros = await Retro.find({ projectId: req.params.projectId });

    const retros = await Retro.find({
      projectId,
      userId: (req as any).user._id, // 🔥 사용자 필터
    }).sort({ createdAt: -1 });

    res.json(retros);
  } catch (error) {
    res.status(500).json({ message: "회고 조회 실패", error });
  }
};

// 회고 수정
export const updateRetro = async (req: Request, res: Response) => {
  try {
    const updated = await Retro.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: (req as any).user._id,
      },
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "회고 없음" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "회고 수정 실패" });
  }
};

// 회고 삭제
export const deleteRetro = async (req: Request, res: Response) => {
  try {
    await Retro.findOneAndDelete({
      _id: req.params.id,
      userId: (req as any).user._id,
    });
    res.json({ message: "회고 삭제 완료" });
  } catch (error) {
    res.status(500).json({ message: "회고 삭제 실패", error });
  }
};
