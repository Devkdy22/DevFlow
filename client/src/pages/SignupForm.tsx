import React, { useState } from "react";
import { ArrowRight, Code, Lock, Mail, User } from "lucide-react";
import { register } from "../services/auth";
import { getErrorMessage } from "../utils/error";

interface SignupFormProps {
  onSubmit?: (
    name: string,
    email: string,
    password: string,
    github: string
  ) => Promise<void>;
  onGitHubSignup?: () => void;
  onGoLogin?: () => void;
}

type FocusField =
  | null
  | "name"
  | "email"
  | "github"
  | "password"
  | "confirmPassword";

export function SignupForm({ onSubmit, onGitHubSignup, onGoLogin }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [isFocused, setIsFocused] = useState<FocusField>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!name.trim()) return setErr("이름을 입력하세요.");
    if (!email.trim()) return setErr("이메일을 입력하세요.");
    if (!password) return setErr("비밀번호를 입력하세요.");
    if (password !== confirmPassword) {
      return setErr("비밀번호가 일치하지 않습니다.");
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(name.trim(), email.trim(), password, github.trim());
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          ...(github.trim() ? { githubId: github.trim() } : {}),
        });
      }
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "회원가입 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 h-full">
      <div className="w-full max-w-2xl">
        {err && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl">
            <p className="text-red-600 text-sm">{err}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label
              htmlFor="signup-name"
              className="text-gray-700 ml-1 block text-sm font-medium"
            >
              이름
            </label>
            <div
              className={`
                relative group
                transition-all duration-300
                ${isFocused === "name" ? "scale-[1.01]" : ""}
              `}
            >
              <div
                className={`
                  absolute inset-0 bg-gradient-to-r from-[#4F46E5]/20 to-[#10B981]/20 rounded-xl blur-xl
                  transition-opacity duration-300
                  ${isFocused === "name" ? "opacity-100" : "opacity-0"}
                `}
              />
              <div
                className="relative bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50
                           hover:border-[#4F46E5]/30 transition-all duration-300
                           shadow-sm hover:shadow-md"
              >
                <User
                  className={`
                    absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300
                    ${isFocused === "name" ? "text-[#4F46E5]" : "text-gray-400"}
                  `}
                />
                <input
                  id="signup-name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setIsFocused("name")}
                  onBlur={() => setIsFocused(null)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 focus:outline-none
                             text-gray-900 placeholder:text-gray-400 text-base"
                  required
                  autoComplete="name"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="signup-email"
              className="text-gray-700 ml-1 block text-sm font-medium"
            >
              이메일
            </label>
            <div
              className={`
                relative group
                transition-all duration-300
                ${isFocused === "email" ? "scale-[1.01]" : ""}
              `}
            >
              <div
                className={`
                  absolute inset-0 bg-gradient-to-r from-[#4F46E5]/20 to-[#10B981]/20 rounded-xl blur-xl
                  transition-opacity duration-300
                  ${isFocused === "email" ? "opacity-100" : "opacity-0"}
                `}
              />
              <div
                className="relative bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50
                           hover:border-[#4F46E5]/30 transition-all duration-300
                           shadow-sm hover:shadow-md"
              >
                <Mail
                  className={`
                    absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300
                    ${isFocused === "email" ? "text-[#4F46E5]" : "text-gray-400"}
                  `}
                />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="developer@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setIsFocused("email")}
                  onBlur={() => setIsFocused(null)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 focus:outline-none
                             text-gray-900 placeholder:text-gray-400 text-base"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="signup-github"
              className="text-gray-700 ml-1 block text-sm font-medium"
            >
              GitHub 아이디 (선택사항)
            </label>
            <div
              className={`
                relative group
                transition-all duration-300
                ${isFocused === "github" ? "scale-[1.01]" : ""}
              `}
            >
              <div
                className={`
                  absolute inset-0 bg-gradient-to-r from-[#4F46E5]/20 to-[#10B981]/20 rounded-xl blur-xl
                  transition-opacity duration-300
                  ${isFocused === "github" ? "opacity-100" : "opacity-0"}
                `}
              />
              <div
                className="relative bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50
                           hover:border-[#4F46E5]/30 transition-all duration-300
                           shadow-sm hover:shadow-md"
              >
                <Code
                  className={`
                    absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300
                    ${isFocused === "github" ? "text-[#4F46E5]" : "text-gray-400"}
                  `}
                />
                <input
                  id="signup-github"
                  type="text"
                  placeholder="username"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  onFocus={() => setIsFocused("github")}
                  onBlur={() => setIsFocused(null)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 focus:outline-none
                             text-gray-900 placeholder:text-gray-400 text-base"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="signup-password"
              className="text-gray-700 ml-1 block text-sm font-medium"
            >
              비밀번호
            </label>
            <div
              className={`
                relative group
                transition-all duration-300
                ${isFocused === "password" ? "scale-[1.01]" : ""}
              `}
            >
              <div
                className={`
                  absolute inset-0 bg-gradient-to-r from-[#4F46E5]/20 to-[#10B981]/20 rounded-xl blur-xl
                  transition-opacity duration-300
                  ${isFocused === "password" ? "opacity-100" : "opacity-0"}
                `}
              />
              <div
                className="relative bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50
                           hover:border-[#4F46E5]/30 transition-all duration-300
                           shadow-sm hover:shadow-md"
              >
                <Lock
                  className={`
                    absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300
                    ${isFocused === "password" ? "text-[#4F46E5]" : "text-gray-400"}
                  `}
                />
                <input
                  id="signup-password"
                  type="password"
                  placeholder="8자 이상 입력해주세요"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setIsFocused("password")}
                  onBlur={() => setIsFocused(null)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 focus:outline-none
                             text-gray-900 placeholder:text-gray-400 text-base"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="signup-confirm-password"
              className="text-gray-700 ml-1 block text-sm font-medium"
            >
              비밀번호 확인
            </label>
            <div
              className={`
                relative group
                transition-all duration-300
                ${isFocused === "confirmPassword" ? "scale-[1.01]" : ""}
              `}
            >
              <div
                className={`
                  absolute inset-0 bg-gradient-to-r from-[#4F46E5]/20 to-[#10B981]/20 rounded-xl blur-xl
                  transition-opacity duration-300
                  ${isFocused === "confirmPassword" ? "opacity-100" : "opacity-0"}
                `}
              />
              <div
                className="relative bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50
                           hover:border-[#4F46E5]/30 transition-all duration-300
                           shadow-sm hover:shadow-md"
              >
                <Lock
                  className={`
                    absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300
                    ${
                      isFocused === "confirmPassword"
                        ? "text-[#4F46E5]"
                        : "text-gray-400"
                    }
                  `}
                />
                <input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onFocus={() => setIsFocused("confirmPassword")}
                  onBlur={() => setIsFocused(null)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 focus:outline-none
                             text-gray-900 placeholder:text-gray-400 text-base"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-[#4F46E5] to-[#4338CA]
                         hover:from-[#4338CA] hover:to-[#3730A3] disabled:opacity-50 disabled:cursor-not-allowed
                         text-white py-4 rounded-xl
                         shadow-lg shadow-[#4F46E5]/25 hover:shadow-xl hover:shadow-[#4F46E5]/40
                         transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? "회원가입 중..." : "회원가입"}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div
                className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0
                           transition-transform duration-300"
              />
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-1 border-t border-gray-200/50" />
              <span className="px-4 text-sm text-gray-400">또는</span>
              <div className="flex-1 border-t border-gray-200/50" />
            </div>

            <button
              type="button"
              className="w-full relative group py-4 rounded-xl border border-gray-200/50
                         bg-white/30 backdrop-blur-sm hover:bg-white/50
                         hover:border-gray-300 transition-all duration-300
                         hover:scale-[1.02] shadow-sm hover:shadow-md"
              onClick={onGitHubSignup}
            >
              <svg className="w-5 h-5 mr-2 inline-block" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              <span className="text-gray-700">GitHub로 계속하기</span>
            </button>

            <p className="text-center text-gray-600 text-sm mt-6">
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                onClick={onGoLogin}
                className="text-[#4e46e5a4] hover:text-[#4338CA] font-semibold transition-colors duration-300"
              >
                로그인
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
