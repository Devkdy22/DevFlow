import { Router } from "express";
import Task from "../models/Task";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// 태스크 생성
router.post("/", protect, createTask);

// 태스크 조회 (🔥 projectId는 query)
router.get("/", protect, getTasks);

// 태스크 수정
router.put("/:id", protect, updateTask);

// 태스크 삭제
router.delete("/:id", protect, deleteTask);

export default router;
