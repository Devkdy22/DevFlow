// src/controllers/scheduleController.ts
import { Request, Response } from "express";
import Schedule from "../models/Schedule";

// 일정 생성
export const createSchedule = async (req: Request, res: Response) => {
  try {
    // 보호 라우트가 적용되어 req.user가 있음을 가정하고 userId 할당
    const payload = { ...req.body, userId: (req as any).user?.id };
    const schedule = new Schedule(payload);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    console.error("schedule create error:", error); // 디버깅 로그
    res.status(500).json({ message: "일정 생성 실패", error });
  }
};

// 전체 일정 조회
export const getAllSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "일정 조회 실패", error });
  }
};

// 사용자별 일정 조회
export const getSchedulesByUser = async (req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find({ userId: req.params.userId });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "사용자 일정 조회 실패", error });
  }
};

// 일정 수정
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "일정 없음" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "일정 수정 실패", error });
  }
};

// 일정 삭제
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "일정 삭제 완료" });
  } catch (error) {
    res.status(500).json({ message: "일정 삭제 실패", error });
  }
};
