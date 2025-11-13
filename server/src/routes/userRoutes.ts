// src/routes/userRoutes.ts
import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getMe,
  updateName,
  updatePassword,
  deleteMe,
} from "../controllers/userController";

const router = Router();

router.get("/me", protect, getMe);
router.put("/me/name", protect, updateName);
router.put("/me/password", protect, updatePassword);
router.delete("/me", protect, deleteMe);

export default router;
