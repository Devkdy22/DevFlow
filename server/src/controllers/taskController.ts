// src/controllers/taskController.ts
import { Request, Response } from "express";
import Task from "../models/Task";
import { Types } from "mongoose";
import Project from "../models/Project";

// 태스크 생성
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, projectId, status, dueDate } = req.body;
    /* 1️⃣ 필수 값 검증 */
    if (!title || !projectId) {
      return res.status(400).json({
        message: "title과 projectId는 필수입니다.",
      });
    }

    /* 2️⃣ projectId ObjectId 유효성 검사 */
    if (!Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        message: "유효하지 않은 projectId입니다.",
      });
    }

    const projectObjectId = new Types.ObjectId(projectId);

    /* 3️⃣ 프로젝트 존재 여부 + 로그인 유저 소유 확인 */
    const project = await Project.findOne({
      _id: projectObjectId,
      userId: req.user!.id, // 🔥 로그인한 사용자
    });

    if (!project) {
      return res.status(404).json({
        message: "해당 프로젝트를 찾을 수 없습니다.",
      });
    }

    /* 4️⃣ 태스크 생성 */
    const task = await Task.create({
      title,
      projectId: projectObjectId,
      userId: new Types.ObjectId(req.user!.id),
      status: status ?? "todo",
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    res.status(201).json(task);
  } catch (error: any) {
    console.error("🔥 createTask error:", error);

    res.status(500).json({
      message: "태스크 생성 실패",
      error: error.message,
    });
  }
};

// 특정 프로젝트 태스크 조회
export const getTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    const userObjectId = new Types.ObjectId(req.user!.id);

    console.log("🔥 getTasks called");
    console.log("🔥 userId:", req.user!.id);
    console.log("🔥 projectId:", projectId);

    const filter: any = {
      userId: userObjectId,
    };

    // 🔥 projectId가 있을 때만 필터 추가
    if (projectId) {
      if (!Types.ObjectId.isValid(projectId as string)) {
        return res.status(400).json({
          message: "유효하지 않은 projectId",
        });
      }

      filter.projectId = new Types.ObjectId(projectId as string);
    }
    console.log("🔥 filter:", filter);

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    console.log("🔥 tasks:", tasks.length);

    res.json(tasks);
  } catch (error: any) {
    console.error("🔥 getTasks error:", error);
    res.status(500).json({
      message: "태스크 조회 실패",
      error: error.message,
    });
  }
};

// 태스크 수정
export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = new Types.ObjectId(req.params.id);
    const userObjectId = new Types.ObjectId(req.user!.id);

    if (req.body.projectId) {
      if (!Types.ObjectId.isValid(req.body.projectId)) {
        return res.status(400).json({ message: "유효하지 않은 projectId" });
      }
      req.body.projectId = new Types.ObjectId(req.body.projectId);
    }

    const updated = await Task.findOneAndUpdate(
      { _id: taskId, userId: userObjectId }, // 🔥 소유자 제한
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "태스크 없음" });
    }

    res.json(updated);

    if (!updated) {
      return res.status(404).json({ message: "태스크 없음" });
    }
  } catch (error) {
    res.status(500).json({ message: "태스크 수정 실패", error });
  }
};

// 태스크 삭제
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = new Types.ObjectId(req.params.id);
    const userObjectId = new Types.ObjectId(req.user!.id);

    const deleted = await Task.findOneAndDelete({
      _id: taskId,
      userId: userObjectId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "태스크 없음" });
    }

    res.json({ message: "태스크 삭제 완료" });
  } catch (error) {
    res.status(500).json({ message: "태스크 삭제 실패", error });
  }
};
