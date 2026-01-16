import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// export interface AuthRequest extends Request {
//   user: { id: string }; // non-optional으로 변경
// }
export interface JwtPayload {
  id: string;
}

export const protect = (
  req: Request, // 보호 미들웨어는 일반 Request로 받고
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "인증 토큰이 없습니다." });

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
    //   userId: string;
    // };
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    console.log("Decoded token:", decoded);
    // (req as AuthRequest).user = { id: decoded.userId }; // 타입 단언 후 할당
    // req.user = { id: decoded.userId };
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "토큰 검증 실패", error });
  }
};
