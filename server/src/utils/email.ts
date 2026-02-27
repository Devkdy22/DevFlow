import nodemailer from "nodemailer";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

type SendEmailResult = {
  provider: "smtp" | "resend";
  id?: string;
};

const getEmailProvider = (): "smtp" | "resend" => {
  const configured = (process.env.EMAIL_PROVIDER || "").toLowerCase().trim();
  if (configured === "smtp" || configured === "resend") return configured;
  return process.env.RESEND_API_KEY ? "resend" : "smtp";
};

const getFromAddress = () => {
  const from = process.env.EMAIL_FROM?.trim();
  if (from) return from;
  const smtpUser = process.env.SMTP_USER?.trim();
  if (smtpUser) return `"DevFlow" <${smtpUser}>`;
  return `"DevFlow" <no-reply@example.com>`;
};

const createSmtpTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP 환경 변수가 설정되지 않았습니다. (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)"
    );
  }

  const port = Number(SMTP_PORT);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`SMTP_PORT가 올바르지 않습니다: ${SMTP_PORT}`);
  }

  const secure =
    (process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    requireTLS: !secure,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
    tls:
      (process.env.SMTP_TLS_REJECT_UNAUTHORIZED || "").toLowerCase() === "false"
        ? { rejectUnauthorized: false }
        : undefined,
  });
};

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const provider = getEmailProvider();
  const from = getFromAddress();

  if (provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY가 설정되지 않았습니다.");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {}),
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { id?: string; message?: string }
      | { error?: { message?: string } }
      | null;

    if (!response.ok) {
      const message =
        (data as any)?.error?.message ||
        (data as any)?.message ||
        `HTTP ${response.status}`;
      throw new Error(`Resend 이메일 전송 실패: ${message}`);
    }

    return { provider: "resend", id: (data as any)?.id };
  }

  const transporter = createSmtpTransporter();
  const info = await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  return { provider: "smtp", id: info.messageId };
}

export async function verifyEmailProvider(): Promise<void> {
  const provider = getEmailProvider();
  if (provider === "resend") return;
  const transporter = createSmtpTransporter();
  await transporter.verify();
}
