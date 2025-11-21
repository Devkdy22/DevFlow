import axios from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "서버 오류";
  }
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류";
};
