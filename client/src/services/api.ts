import axios from "axios";

const rawBaseURL = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const baseURL = rawBaseURL ? rawBaseURL.replace(/\/+$/, "") : "";

if (!baseURL) {
  console.warn(
    "VITE_API_URL is not set. API requests will use the current origin, which will break in production."
  );
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// ✅ 모든 요청에 토큰 자동 첨부
api.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
