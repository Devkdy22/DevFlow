import { Router } from "express";
import Project from "../models/Project";
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// 인증 필요
router.post("/", protect, createProject);
router.get("/", protect, getUserProjects);

// 특정 프로젝트 조회/수정/삭제
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

// 모든 프로젝트 조회
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "프로젝트 조회 실패", error });
  }
});

// 단일 프로젝트 조회
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.status(404).json({ message: "프로젝트를 찾을 수 없습니다" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "프로젝트 조회 실패", error });
  }
});

// 프로젝트 생성
router.post("/", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: "프로젝트 생성 실패", error });
  }
});

export default router;
