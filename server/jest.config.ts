/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFiles: ["<rootDir>/src/__tests__/loadEnv.ts"], // 테스트 시작 전 환경 변수 로드
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"], // 공통 setup (DB 연결 등)
};
