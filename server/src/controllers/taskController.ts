// src/controllers/taskController.ts
import { Request, Response } from "express";
import Task from "../models/Task";

// 태스크 생성
export const createTask = async (req: Request, res: Response) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "태스크 생성 실패", error });
  }
};

// 특정 프로젝트 태스크 조회
export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "태스크 조회 실패", error });
  }
};

// 태스크 수정
export const updateTask = async (req: Request, res: Response) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "태스크 없음" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "태스크 수정 실패", error });
  }
};

// 태스크 삭제
export const deleteTask = async (req: Request, res: Response) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "태스크 삭제 완료" });
  } catch (error) {
    res.status(500).json({ message: "태스크 삭제 실패", error });
  }
};
