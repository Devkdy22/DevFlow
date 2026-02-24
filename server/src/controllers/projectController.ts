// src/controllers/projectController.ts
import { Request, NextFunction, Response } from "express";
import Project from "../models/Project";
// import { AuthRequest } from "../middleware/authMiddleware";
import { Types } from "mongoose";

// 프로젝트 생성
export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, category, priority } = req.body;
    const userObjectId = new Types.ObjectId(req.user!.id);

    const project = new Project({
      userId: userObjectId,
      title,
      description,
      category,
      priority,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// 프로젝트 전체 조회 (유저 기준)
export const getUserProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userObjectId = new Types.ObjectId(req.user!.id);

    const projects = await Project.find({ userId: userObjectId }).lean();
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// 특정 프로젝트 조회
export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = new Types.ObjectId(req.params.id);
    const userObjectId = new Types.ObjectId(req.user!.id);

    const project = await Project.findOne({
      _id: projectId,
      userId: userObjectId, //소유자 검증
    }).lean();

    if (!project) return res.status(404).json({ message: "프로젝트 없음" });

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// 프로젝트 수정
export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = new Types.ObjectId(req.params.id);
    const userObjectId = new Types.ObjectId(req.user!.id);

    const updated = await Project.findOneAndUpdate(
      { _id: projectId, userId: userObjectId },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "프로젝트 없음" });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// 프로젝트 삭제
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = new Types.ObjectId(req.params.id);
    const userObjectId = new Types.ObjectId(req.user!.id);

    await Project.findOneAndDelete({
      _id: projectId,
      userId: userObjectId,
    });

    res.json({ message: "프로젝트 삭제 완료" });
  } catch (error) {
    next(error);
  }
};
