import nodemailer from "nodemailer";
import dotenv from "dotenv";

// .env 불러오기 (서버 기준 경로 맞게)
dotenv.config({ path: ".env" });

console.log("===== SMTP ENV CHECK =====");
console.log("HOST:", process.env.SMTP_HOST);
console.log("PORT:", process.env.SMTP_PORT);
console.log("USER:", process.env.SMTP_USER);
console.log("PASS:", process.env.SMTP_PASS ? "**** 설정됨" : "없음");
console.log("==========================");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendTestMail() {
  try {
    const info = await transporter.sendMail({
      from: `"DevFlow SMTP Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // 자기 자신한테 전송
      subject: "✅ DevFlow SMTP 테스트 성공",
      html: `
        <h2>SMTP 테스트 메일</h2>
        <p>이 메일이 보이면 SMTP 설정은 정상입니다.</p>
        <p>전송 시각: ${new Date().toLocaleString()}</p>
      `,
    });

    console.log("✅ 메일 발송 성공!");
    console.log("MessageID:", info.messageId);
    console.log("Response:", info.response);
  } catch (err) {
    console.error("❌ 메일 발송 실패:", err);
  }
}

sendTestMail();
