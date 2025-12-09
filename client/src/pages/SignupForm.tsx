// pages/SignupForm.tsx
import React, { useState, useCallback, memo } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Lock, Mail, User, Code, ArrowRight } from "lucide-react";
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
}

// InputField를 별도 컴포넌트로 분리하고 memo로 최적화
interface InputFieldProps {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: typeof Lock;
  label: string;
  required?: boolean;
  minLength?: number;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const InputField = memo(
  ({
    id,
    type,
    placeholder,
    value,
    onChange,
    icon: Icon,
    label,
    required = false,
    minLength,
    isFocused,
    onFocus,
    onBlur,
  }: InputFieldProps) => {
    return (
      <div className="space-y-3">
        <Label htmlFor={id} className="text-gray-700 ml-1">
          {label}
        </Label>
        <div
          className={`
          relative group
          transition-all duration-300
          ${isFocused ? "scale-[1.01]" : ""}
        `}
        >
          <div
            className={`
          absolute inset-0 bg-gradient-to-r from-[#10B981]/20 to-[#4F46E5]/20 rounded-xl blur-xl
          transition-opacity duration-300
          ${isFocused ? "opacity-100" : "opacity-0"}
        `}
          />
          <div
            className="relative bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 
                        hover:border-[#10B981]/30 transition-all duration-300
                        shadow-sm hover:shadow-md"
          >
            <Icon
              className={`
            absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300
            ${isFocused ? "text-[#10B981]" : "text-gray-400"}
          `}
            />
            <Input
              id={id}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange(e.target.value)
              }
              onFocus={onFocus}
              onBlur={onBlur}
              className="pl-12 pr-4 py-6 bg-transparent border-none focus:ring-0 focus-visible:ring-0"
              required={required}
              minLength={minLength}
              autoComplete={
                type === "email"
                  ? "email"
                  : type === "password"
                  ? "current-password"
                  : "off"
              }
            />
          </div>
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";
//onGitHubSignup
export function SignupForm({ onSubmit, onGitHubSignup }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [github, setGithub] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!name.trim()) return setErr("이름을 입력하세요.");
    if (!email.trim()) return setErr("이메일을 입력하세요.");
    if (!password) return setErr("비밀번호를 입력하세요.");
    if (password !== confirmPassword)
      return setErr("비밀번호가 일치하지 않습니다.");

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(name.trim(), email.trim(), password, github.trim());
      } else {
        const payload = {
          name: name.trim(),
          email: email.trim(),
          password,
          ...(github.trim() ? { githubId: github.trim() } : {}),
        };
        await register(payload);
        alert("회원가입이 완료되었습니다!");
      }
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "회원가입 실패");
    } finally {
      setLoading(false);
    }
  };

  // 각 필드의 포커스/블러 핸들러를 useCallback으로 메모이제이션
  const handleFocus = useCallback((fieldId: string) => {
    setFocusedField(fieldId);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  // onChange 핸들러들을 useCallback으로 메모이제이션
  const handleNameChange = useCallback((value: string) => setName(value), []);
  const handleEmailChange = useCallback((value: string) => setEmail(value), []);
  const handleGithubChange = useCallback(
    (value: string) => setGithub(value),
    []
  );
  const handlePasswordChange = useCallback(
    (value: string) => setPassword(value),
    []
  );
  const handleConfirmPasswordChange = useCallback(
    (value: string) => setConfirmPassword(value),
    []
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 max-w-md mx-auto p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-lg"
    >
      {err && <p className="text-red-500 text-sm">{err}</p>}

      <InputField
        id="signup-name"
        type="text"
        placeholder="홍길동"
        value={name}
        onChange={handleNameChange}
        icon={User}
        label="이름"
        required
        isFocused={focusedField === "signup-name"}
        onFocus={() => handleFocus("signup-name")}
        onBlur={handleBlur}
      />

      <InputField
        id="signup-email"
        type="email"
        placeholder="developer@example.com"
        value={email}
        onChange={handleEmailChange}
        icon={Mail}
        label="이메일"
        required
        isFocused={focusedField === "signup-email"}
        onFocus={() => handleFocus("signup-email")}
        onBlur={handleBlur}
      />

      <InputField
        id="signup-github"
        type="text"
        placeholder="username"
        value={github}
        onChange={handleGithubChange}
        icon={Code}
        label="GitHub 아이디 (선택사항)"
        isFocused={focusedField === "signup-github"}
        onFocus={() => handleFocus("signup-github")}
        onBlur={handleBlur}
      />

      <InputField
        id="signup-password"
        type="password"
        placeholder="8자 이상 입력해주세요"
        value={password}
        onChange={handlePasswordChange}
        icon={Lock}
        label="비밀번호"
        required
        minLength={8}
        isFocused={focusedField === "signup-password"}
        onFocus={() => handleFocus("signup-password")}
        onBlur={handleBlur}
      />

      <InputField
        id="signup-confirm-password"
        type="password"
        placeholder="비밀번호를 다시 입력해주세요"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        icon={Lock}
        label="비밀번호 확인"
        required
        minLength={8}
        isFocused={focusedField === "signup-confirm-password"}
        onFocus={() => handleFocus("signup-confirm-password")}
        onBlur={handleBlur}
      />

      <div className="pt-2 space-y-4">
        <Button
          type="submit"
          className="w-full relative group overflow-hidden bg-gradient-to-r from-[#10B981] to-[#059669] 
                     hover:from-[#059669] hover:to-[#047857] text-white py-6 rounded-xl
                     shadow-lg shadow-[#10B981]/25 hover:shadow-xl hover:shadow-[#10B981]/40
                     transition-all duration-300 hover:scale-[1.02]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? "회원가입 중..." : "회원가입"}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
          <div
            className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 
                          transition-transform duration-300"
          />
        </Button>

        <div className="relative flex items-center py-2">
          <div className="flex-1 border-t border-gray-200/50" />
          <span className="px-4 text-sm text-gray-400">또는</span>
          <div className="flex-1 border-t border-gray-200/50" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onGitHubSignup}
          className="w-full relative group py-6 rounded-xl border-gray-200/50 
                     bg-white/30 backdrop-blur-sm hover:bg-white/50
                     hover:border-gray-300 transition-all duration-300 
                     hover:scale-[1.02] shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          <span className="text-gray-700">GitHub로 계속하기</span>
        </Button>
      </div>
    </form>
  );
}
