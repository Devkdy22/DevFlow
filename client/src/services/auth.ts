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
