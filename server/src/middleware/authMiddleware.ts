import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface JwtPayload {
  id?: string;
  userId?: string;
  email?: string;
}

export interface AuthRequest extends Request {
  user: { id: string };
}

export const protect = (
  req: Request, // 보호 미들웨어는 일반 Request로 받고
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "인증 토큰이 없습니다." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decoded.userId ?? decoded.id;
    if (!userId) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
    req.user = { id: userId };
    next();
  } catch (error) {
    res.status(401).json({ message: "토큰 검증 실패", error });
  }
};
