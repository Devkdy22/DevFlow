import { Router, Request, Response } from "express";
import Project from "../models/Project.js";

const router = Router();

// Get all projects
router.get("/", async (_req: Request, res: Response) => {
  const projects = await Project.find();
  res.json(projects);
});

// Add new project
router.post("/", async (req: Request, res: Response) => {
  const project = new Project(req.body);
  await project.save();
  res.status(201).json(project);
});

export default router;
