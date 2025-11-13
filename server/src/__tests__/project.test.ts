import request from "supertest";
import app from "../app";
import { createAndLogin } from "./testUtils";

describe("Project API", () => {
  let token: string;
  let createdId: string;

  beforeAll(async () => {
    const result = await createAndLogin();
    token = result.token;
  });

  it("프로젝트 생성 -> 201", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "테스트 프로젝트",
        description: "설명",
        category: "개인",
        priority: "보통",
      });

    if (res.statusCode !== 201) {
      console.error("Project create failed:", res.statusCode, res.body);
    }
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("title", "테스트 프로젝트");
    createdId = res.body._id;
  });

  it("사용자 프로젝트 조회 -> 200 및 생성한 프로젝트 포함", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    if (res.statusCode !== 200) {
      console.error("Project list failed:", res.statusCode, res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.find((p: any) => p._id === createdId)).toBeDefined();
  });
});
