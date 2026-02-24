import crypto from "crypto";
import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// 재설정 토큰 생성 (원본 + 해시)
export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
};

// 이메일 전송 설정
// export const createTransporter = () => {
//   return nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT),
//     secure: false, // // true이면 465 포트, false이면 587
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });
// };

// const transporter = createTransporter();
// transporter.verify((err, success) => {
//   if (err) console.error("SMTP 연결 실패:", err);
//   else console.log("SMTP 연결 성공");
// });
export const createTransporter = (): Transporter => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP 환경 변수가 설정되지 않았습니다.");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false, // 465: SSL, 587: STARTTLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // 인증서 무시
    },
  });
};

const testSMTPConnection = async () => {
  const transporter = createTransporter();
  try {
    await transporter.verify(); // Transporter 타입이므로 오류 없음
    console.log("SMTP 연결 성공 ✅");
  } catch (err) {
    console.error("SMTP 연결 실패 ❌", err);
  }
};
const hasSMTPConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
};

if (hasSMTPConfig()) {
  void testSMTPConnection();
} else {
  console.warn("Warning: SMTP_* 환경 변수가 없어 메일 기능이 비활성 상태입니다.");
}

// 비밀번호 재설정 이메일 발송
export async function sendResetEmail(email: string, token: string) {
  console.log("sendResetEmail 호출됨:", email, token);
  const transporter = createTransporter();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}?reset_token=${token}`;

  const mailOptions = {
    from: `"DevFlow" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "DevFlow 비밀번호 재설정",
    html: `
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
    `,
  };

  // await transporter.sendMail(mailOptions);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("메일 전송 성공:", info);
    console.log("MessageId:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
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
