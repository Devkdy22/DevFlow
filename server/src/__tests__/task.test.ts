import request from "supertest";
import app from "../app";

describe("Task API", () => {
  let token: string;
  let created: any;

  beforeAll(async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "testuser@example.com", password: "password123" });
    token = login.body.token;
  });

  it("태스크 생성 -> 201", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId: "project123",
        title: "할 일 테스트",
        status: "할 일",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    created = res.body;
  });

  it("프로젝트 태스크 조회 -> 200", async () => {
    const res = await request(app)
      .get(`/api/tasks/project/${created.projectId}`) // 실제 라우트에 맞게 수정
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
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
