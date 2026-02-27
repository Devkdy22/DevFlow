import crypto from "crypto";
import dotenv from "dotenv";
import { sendEmail, verifyEmailProvider } from "./email";
dotenv.config();

// 재설정 토큰 생성 (원본 + 해시)
export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
};

// Backwards compat export (legacy code may import this symbol).
// Prefer using sendEmail()/verifyEmailProvider() from ./email.
export const createTransporter = () => {
  throw new Error(
    "createTransporter는 더 이상 사용하지 않습니다. sendEmail()을 사용하세요."
  );
};

if ((process.env.EMAIL_VERIFY_ON_BOOT || "").toLowerCase() === "true") {
  void verifyEmailProvider().then(
    () => console.log("Email provider verified ✅"),
    err => console.error("Email provider verify failed ❌", err)
  );
}

// 비밀번호 재설정 이메일 발송
export async function sendResetEmail(email: string, token: string) {
  console.log("sendResetEmail 호출됨:", email, token);

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}?reset_token=${token}`;

  const subject = "DevFlow 비밀번호 재설정";
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #10B981 100%); 
                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4F46E5; color: white; 
                     padding: 14px 28px; text-decoration: none; border-radius: 8px; 
                     font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; 
                      padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 비밀번호 재설정</h1>
            </div>
            <div class="content">
              <p>안녕하세요,</p>
              <p>DevFlow 계정의 비밀번호 재설정 요청을 받았습니다.</p>
              <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">비밀번호 재설정하기</a>
              </div>
              
              <p>버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
              <p style="word-break: break-all; color: #4F46E5; font-size: 14px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ 중요:</strong>
                <ul style="margin: 10px 0;">
                  <li>이 링크는 <strong>${
                    process.env.RESET_TOKEN_EXPIRES_MIN || 60
                  }분</strong> 동안만 유효합니다.</li>
                  <li>비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.</li>
                  <li>보안을 위해 이 링크를 다른 사람과 공유하지 마세요.</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 DevFlow. All rights reserved.</p>
              <p>이 이메일은 자동으로 발송되었습니다.</p>
            </div>
          </div>
        </body>
      </html>
    `;

  try {
    const result = await sendEmail({ to: email, subject, html });
    console.log("메일 전송 성공:", result);
    return { message: "비밀번호 재설정 메일을 보냈습니다. 메일을 확인하세요." };
  } catch (error) {
    console.error("메일 전송 실패:", error);
    throw new Error("메일 전송에 실패했습니다.");
  }
}

// GitHub OAuth 상태 토큰 생성
export function generateOAuthState() {
  return crypto.randomBytes(16).toString("hex");
}

// JWT 토큰 검증 미들웨어
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultsecret"
    ) as { id: string; email: string };

    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
}
