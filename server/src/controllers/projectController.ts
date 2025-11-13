// src/controllers/projectController.ts
import { Request, Response } from "express";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/authMiddleware";

// 프로젝트 생성
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, priority } = req.body;
    const project = new Project({
      userId: req.user.id,
      title,
      description,
      category,
      priority,
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "프로젝트 생성 실패", error });
  }
};

// 프로젝트 전체 조회 (유저 기준)
export const getUserProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "프로젝트 조회 실패", error });
  }
};

// 특정 프로젝트 조회
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "프로젝트 없음" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "프로젝트 조회 실패", error });
  }
};

// 프로젝트 수정
export const updateProject = async (req: Request, res: Response) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "프로젝트 없음" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "프로젝트 수정 실패", error });
  }
};

// 프로젝트 삭제
export const deleteProject = async (req: Request, res: Response) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "프로젝트 삭제 완료" });
  } catch (error) {
    res.status(500).json({ message: "프로젝트 삭제 실패", error });
  }
};
