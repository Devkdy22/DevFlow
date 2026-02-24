import { Request, Response } from "express";
import Schedule from "../models/Schedule";

const normalizeSchedulePayload = (raw: Record<string, unknown>) => {
  const payload = { ...raw } as Record<string, unknown>;
  const start = payload.startDate;
  const end = payload.endDate;
  const date = payload.date;

  const toDateOrUndefined = (value: unknown) => {
    if (!value || typeof value !== "string") return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
  };

  const normalizedStart = toDateOrUndefined(start);
  const normalizedEnd = toDateOrUndefined(end);
  const normalizedDate = toDateOrUndefined(date);

  if (normalizedStart) payload.startDate = normalizedStart;
  else delete payload.startDate;

  if (normalizedEnd) payload.endDate = normalizedEnd;
  else delete payload.endDate;

  if (normalizedDate) {
    payload.date = normalizedDate;
  } else if (normalizedStart) {
    payload.date = normalizedStart;
  } else if (normalizedEnd) {
    payload.date = normalizedEnd;
  }

  return payload;
};

// 일정 생성
export const createSchedule = async (req: Request, res: Response) => {
  try {
    // 보호 라우트가 적용되어 req.user가 있음을 가정하고 userId 할당
    const payload = normalizeSchedulePayload({
      ...req.body,
      userId: (req as any).user?.id,
    });
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
    const schedules = await Schedule.find().lean();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "일정 조회 실패", error });
  }
};

// 사용자별 일정 조회
export const getSchedulesByUser = async (req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find({ userId: req.params.userId }).lean();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "사용자 일정 조회 실패", error });
  }
};

// 일정 수정
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const payload = normalizeSchedulePayload(req.body as Record<string, unknown>);
    const updated = await Schedule.findByIdAndUpdate(req.params.id, payload, {
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
