import { Router } from "express";
import Retro from "../models/Retro";
import {
  createRetro,
  getRetrosByProject,
  updateRetro,
  deleteRetro,
} from "../controllers/retroController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// 회고 생성
router.post("/", protect, createRetro);

// 프로젝트별 회고 조회
router.get("/project/:projectId", protect, getRetrosByProject);

// 수정/삭제
router.put("/:id", protect, updateRetro);
router.delete("/:id", protect, deleteRetro);

// 모든 회고 조회
router.get("/", async (req, res) => {
  try {
    const retros = await Retro.find();
    res.json(retros);
  } catch (error) {
    res.status(500).json({ message: "회고 조회 실패", error });
  }
});

// 특정 프로젝트의 회고 조회
router.get("/project/:projectId", async (req, res) => {
  try {
    const retros = await Retro.find({ projectId: req.params.projectId });
    res.json(retros);
  } catch (error) {
    res.status(500).json({ message: "프로젝트별 회고 조회 실패", error });
  }
});

export default router;
