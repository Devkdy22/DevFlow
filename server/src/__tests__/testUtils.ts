import request from "supertest";
import app from "../app";

export const createAndLogin = async (overrides?: {
  email?: string;
  password?: string;
  name?: string;
}) => {
  const email = overrides?.email ?? `testuser+${Date.now()}@example.com`;
  const password = overrides?.password ?? "password123";
  const name = overrides?.name ?? "Test User";

  // 1) 먼저 로그인 시도
  let loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  // 2) 로그인 실패하면(계정 없거나 비번 불일치) 회원가입 시도 후 다시 로그인
  if (!loginRes.body || !loginRes.body.token) {
    await request(app)
      .post("/api/auth/register")
      .send({ name, email, password });
    loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
  }

  if (!loginRes.body || !loginRes.body.token) {
    throw new Error(`createAndLogin failed: ${JSON.stringify(loginRes.body)}`);
  }

  return { token: loginRes.body.token, email, password };
};
