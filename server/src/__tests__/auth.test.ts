import request from "supertest";
import app from "../app";

describe("Auth API", () => {
  const genEmail = () => `testuser+${Date.now()}@example.com`;
  const password = "password123";

  it("회원가입 성공", async () => {
    const testUser = { name: "TestUser", email: genEmail(), password };
    const res = await request(app).post("/api/auth/register").send(testUser);
    if (res.statusCode !== 201)
      console.error("auth register failed:", res.statusCode, res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("로그인 성공", async () => {
    const email = genEmail();
    // 먼저 회원가입
    await request(app)
      .post("/api/auth/register")
      .send({ name: "LoginUser", email, password });
    // 로그인
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    if (res.statusCode !== 200)
      console.error("auth login failed:", res.statusCode, res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(email);
  });
});
