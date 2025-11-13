import { Router } from "express";
import Schedule from "../models/Schedule";
import {
  createSchedule,
  getAllSchedules,
  getSchedulesByUser,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// 일정 생성 및 조회
router.post("/", protect, createSchedule);
router.get("/", protect, getAllSchedules);
router.get("/user/:userId", protect, getSchedulesByUser);

// 수정/삭제
router.put("/:id", protect, updateSchedule);
router.delete("/:id", protect, deleteSchedule);

// 모든 일정 조회
router.get("/", async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "일정 조회 실패", error });
  }
});

// 사용자별 일정 조회
router.get("/user/:userId", async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.params.userId });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "사용자 일정 조회 실패", error });
  }
});

export default router;
