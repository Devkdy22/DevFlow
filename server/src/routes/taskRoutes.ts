import { Router } from "express";
import Task from "../models/Task";
import {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// 태스크 생성
router.post("/", protect, createTask);

// 특정 프로젝트 태스크 조회
router.get("/project/:projectId", protect, getTasksByProject);

// 수정/삭제
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

// 모든 태스크 조회
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "태스크 조회 실패", error });
  }
});

// 특정 프로젝트의 태스크 조회
router.get("/project/:projectId", async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "프로젝트별 태스크 조회 실패", error });
  }
});

export default router;
