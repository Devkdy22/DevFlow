import request from "supertest";
import app from "../app";
import { createAndLogin } from "./testUtils";

describe("Schedule API", () => {
  let token: string;
  let created: any;

  beforeAll(async () => {
    const result = await createAndLogin();
    token = result.token;
  });

  it("일정 생성 -> 201", async () => {
    const res = await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "회의",
        date: new Date().toISOString(),
        category: "업무",
      });

    if (res.statusCode !== 201) {
      console.error("Schedule create failed:", res.statusCode, res.body);
    }
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    created = res.body;
  });

  it("사용자 일정 조회 -> 200", async () => {
    const res = await request(app)
      .get(`/api/schedules/user/${created.userId}`)
      .set("Authorization", `Bearer ${token}`);

    if (res.statusCode !== 200) {
      console.error("Schedule list failed:", res.statusCode, res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
