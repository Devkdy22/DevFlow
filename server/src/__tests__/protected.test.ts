import request from "supertest";
import app from "../app";

describe("User API (protected)", () => {
  let token: string;

  beforeAll(async () => {
    // 로그인해서 토큰 확보 (auth.test로 회원이 이미 생성되었거나 미리 시드)
    const login = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });
    token = login.body.token;
  });

  it("내 정보 조회 -> 200", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email", "testuser@example.com");
  });

  it("이름 변경 -> 200 및 반영", async () => {
    const res = await request(app)
      .put("/api/users/me/name")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Changed Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Changed Name");
  });

  it("비밀번호 변경 -> 200", async () => {
    const res = await request(app)
      .put("/api/users/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "newpassword123" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  // 회원 탈퇴는 테스트 순서상 마지막에 실행되도록 주의
  it("회원 탈퇴 -> 200", async () => {
    const res = await request(app)
      .delete("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});

let token: string;

beforeAll(async () => {
  const email = "testuser@example.com";
  const password = "password123";

  // 회원가입 (DB가 비어있으므로 안전)
  await request(app)
    .post("/api/auth/register")
    .send({ name: "Test User", email, password });

  // 로그인해서 토큰 얻기
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  token = loginRes.body.token;
});
