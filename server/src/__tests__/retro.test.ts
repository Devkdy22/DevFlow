import request from "supertest";
import app from "../app";

describe("Retro API", () => {
  let token: string;
  let created: any;

  beforeAll(async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "testuser@example.com", password: "password123" });
    token = login.body.token;
  });

  it("회고 생성 -> 201", async () => {
    const res = await request(app)
      .post("/api/retros")
      .set("Authorization", `Bearer ${token}`)
      .send({ projectId: "project123", content: "회고 내용" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    created = res.body;
  });

  it("유저 회고 목록 조회(옵션) -> 200", async () => {
    const res = await request(app)
      .get("/api/retros") // 필요하면 사용자 기준 엔드포인트로 수정
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
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
