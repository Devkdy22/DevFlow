import api from "./api";
import type { AxiosResponse } from "axios";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  githubId?: string;
};

export type AuthUser = {
  _id?: string;
  name?: string;
  email: string;
  githubId?: string;
  [k: string]: unknown;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export const register = (
  payload: RegisterPayload
): Promise<AxiosResponse<AuthResponse>> =>
  api.post<AuthResponse>("/api/auth/register", payload);

export type LoginPayload = {
  email: string;
  password: string;
};

export const login = (
  payload: LoginPayload
): Promise<AxiosResponse<AuthResponse>> =>
  api.post<AuthResponse>("/api/auth/login", payload);

export const me = (): Promise<AxiosResponse<{ user: AuthUser }>> =>
  api.get<{ user: AuthUser }>("/api/users/me");

// export const sendResetPasswordMail = (email: string) =>
//   axios.post("/api/auth/forgot-password", { email });

// export const resetPassword = (token: string, password: string) =>
//   axios.post("/api/auth/reset-password", { token, password });
// 비밀번호 재설정 이메일 발송
export const sendResetPasswordMail = async (email: string) => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data;
};

// 비밀번호 재설정 (토큰 사용)
export const resetPassword = async (token: string, password: string) => {
  const response = await api.post("/api/auth/reset-password", {
    token,
    password,
  });
  return response.data;
};

// GitHub OAuth 시작
export const initiateGitHubAuth = async (mode: "login" | "signup") => {
  const response = await api.get(`/api/auth/github/initiate?mode=${mode}`);
  return response.data;
};

// GitHub OAuth 콜백 처리
export const handleGitHubCallback = async (code: string, state: string) => {
  const response = await api.post("/api/auth/github/callback", {
    code,
    state,
  });
  return response.data;
};

// 현재 사용자 정보 조회
export const getCurrentUser = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};
