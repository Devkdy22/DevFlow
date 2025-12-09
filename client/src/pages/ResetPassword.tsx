import React, { useState } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { resetPassword } from "../services/auth";

type ResetPasswordProps = {
  token: string;
  onSuccess: () => void;
  onBack: () => void;
};

export function ResetPassword({
  token,
  onSuccess,
  onBack,
}: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8)
      return setError("비밀번호는 최소 8자이어야 합니다.");
    if (password !== confirm) return setError("비밀번호가 일치하지 않습니다.");
    if (!token) return setError("유효한 토큰이 없습니다.");

    setLoading(true);
    try {
      await resetPassword(token, password);
      // 성공 — 로그인 페이지로 이동
      alert("비밀번호가 변경되었습니다. 로그인하세요.");
      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "비밀번호 변경 실패");
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-lg">
      <h2 className="text-lg font-bold mb-4">비밀번호 재설정</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="new-password">새 비밀번호</Label>
          <Input
            id="new-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <Label htmlFor="confirm-password">비밀번호 확인</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "처리중..." : "비밀번호 변경"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="w-full"
        >
          뒤로가기
        </Button>
      </form>
    </div>
  );
}
