import { Router } from "express";
import Retro from "../models/Retro";
import {
  createRetro,
  getRetrosByProject,
  updateRetro,
  deleteRetro,
} from "../controllers/retroController";
import { protect } from "../middleware/authMiddleware";
import mongoose from "mongoose";

const router = Router();

// // 회고 생성
router.post("/", protect, createRetro);

// // 프로젝트별 회고 조회
// router.get("/project/:projectId", protect, getRetrosByProject);

// 수정/삭제
// router.put("/:id", protect, updateRetro);
// router.delete("/:id", protect, deleteRetro);

/**
 * 회고 목록 조회 (로그인 유저 기준)
 */
router.get("/", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증 정보가 없습니다." });
    }
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const retros = await Retro.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    const normalized = retros.map(r => ({
      ...r,
      _id: r._id.toString(),
      userId: r.userId.toString(),
      projectId: r.projectId?.toString(),
    }));

    res.json(normalized);
  } catch (error) {
    res.status(500).json({
      message: "회고 조회 실패",
      error,
    });
  }
});
/**
 * 프로젝트별 회고 조회
 */
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증 정보가 없습니다." });
    }

    const retros = await Retro.find({
      userId: new mongoose.Types.ObjectId(req.user.id),
      projectId: new mongoose.Types.ObjectId(req.params.projectId),
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      retros.map(r => ({
        ...r,
        _id: r._id.toString(),
        userId: r.userId.toString(),
        projectId: r.projectId?.toString(),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "회고 조회 실패", error });
  }
});

/**
 * 회고 수정
 */
router.put("/:id", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증 정보가 없습니다." });
    }

    const updated = await Retro.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: new mongoose.Types.ObjectId(req.user.id),
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
});

/**
 * 회고 삭제
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "인증 정보가 없습니다." });
    }

    await Retro.findOneAndDelete({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.user.id),
    });

    res.json({ message: "회고 삭제 완료" });
  } catch (error) {
    res.status(500).json({ message: "회고 삭제 실패" });
  }
});

export default router;
