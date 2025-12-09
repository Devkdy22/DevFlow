import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  ArrowLeft,
  Github,
  Check,
  Loader2,
  Mail,
  KeyRound,
  ArrowRight,
} from "lucide-react";

interface GitHubAuthProps {
  onBack: () => void;
  onSuccess: (user: { id: string; name: string; email?: string }) => void;

  mode?: "signup" | "login";
  onInitialSubmit: (identifier: string) => Promise<void> | void;
  onVerification: (code: string) => Promise<void> | void;
}

export function GitHubAuth({ onBack, onSuccess, mode }: GitHubAuthProps) {
  const [step, setStep] = useState<"input" | "verify" | "success">("input");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [githubId, setGithubId] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // GitHub 정보 확인 및 코드 발송 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setStep("verify");
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 보안 코드 확인 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setStep("success");

    // 잠시 후 대시보드로 이동
    setTimeout(() => {
      onSuccess({
        id: githubId,
        name: githubId,
        email: email || undefined,
      });
    }, 1500);
  };

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8 py-8"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full blur-2xl opacity-50" />
            <div className="relative bg-gradient-to-br from-[#10B981] to-[#059669] p-6 rounded-full">
              <Check className="h-12 w-12 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-3"
        >
          <h2 className="text-gray-900">
            {mode === "login" ? "로그인 성공!" : "가입 완료!"}
          </h2>
          <p className="text-gray-600">DevFlow로 이동합니다...</p>
        </motion.div>
      </motion.div>
    );
  }

  if (step === "verify") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#10B981] rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-[#4F46E5] to-[#4338CA] p-4 rounded-2xl">
                <KeyRound className="h-10 w-10 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-gray-900">보안 코드 입력</h2>
            <p className="text-gray-600 mt-2">
              {mode === "signup"
                ? `${
                    email || githubId
                  }@github.com로 발송된\n보안 코드를 입력해주세요`
                : "등록된 GitHub 이메일로 발송된\n보안 코드를 입력해주세요"}
            </p>
          </motion.div>
        </div>

        {/* Verification Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleVerification}
          className="space-y-6"
        >
          <div className="space-y-3">
            <Label htmlFor="verification-code" className="text-gray-700 ml-1">
              6자리 보안 코드
            </Label>
            <div
              className={`
                relative group
                transition-all duration-300
                ${isFocused === "code" ? "scale-[1.01]" : ""}
              `}
            >
              <div
                className={`
                absolute inset-0 bg-gradient-to-r from-[#4F46E5]/20 to-[#10B981]/20 rounded-xl blur-xl
                transition-opacity duration-300
                ${isFocused === "code" ? "opacity-100" : "opacity-0"}
              `}
              />
              <div
                className="relative bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 
                              hover:border-[#4F46E5]/30 transition-all duration-300
                              shadow-sm hover:shadow-md"
              >
                <KeyRound
                  className={`
                  absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300
                  ${isFocused === "code" ? "text-[#4F46E5]" : "text-gray-400"}
                `}
                />
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={e =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  onFocus={() => setIsFocused("code")}
                  onBlur={() => setIsFocused(null)}
                  className="pl-12 pr-4 py-6 bg-transparent border-none focus:ring-0 focus-visible:ring-0 text-center tracking-widest text-xl"
                  required
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl" />
            <div className="relative bg-white/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4">
              <p className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-lg">📧</span>
                <span>
                  코드가 오지 않았나요?
                  <br />
                  스팸 폴더를 확인하거나 2-3분 후 재전송을 시도해주세요.
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-[#4F46E5] to-[#4338CA] 
                         hover:from-[#4338CA] hover:to-[#3730A3] text-white py-6 rounded-xl
                         shadow-lg shadow-[#4F46E5]/25 hover:shadow-xl hover:shadow-[#4F46E5]/40
                         transition-all duration-300 hover:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  <>
                    확인 및 {mode === "login" ? "로그인" : "가입완료"}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
              <div
                className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 
                              transition-transform duration-300"
              />
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep("input")}
              className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 py-6 rounded-xl
                         transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              다시 입력하기
            </Button>
          </div>
        </motion.form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#10B981] rounded-2xl blur-lg opacity-50" />
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl">
              <Github className="h-10 w-10 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-gray-900">
            GitHub {mode === "login" ? "로그인" : "회원가입"}
          </h2>
          <p className="text-gray-600 mt-2">
            {mode === "login"
              ? "GitHub 계정 정보를 입력해주세요"
              : "GitHub 계정으로 빠르게 시작하세요"}
          </p>
        </motion.div>
      </div>

      {/* Input Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleInitialSubmit}
        className="space-y-5"
      >
        <div className="space-y-3">
          <Label htmlFor="github-id" className="text-gray-700 ml-1">
            GitHub 아이디
          </Label>
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
              <Github
                className={`
                absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300
                ${isFocused === "github" ? "text-[#4F46E5]" : "text-gray-400"}
              `}
              />
              <Input
                id="github-id"
                type="text"
                placeholder="username"
                value={githubId}
                onChange={e => setGithubId(e.target.value)}
                onFocus={() => setIsFocused("github")}
                onBlur={() => setIsFocused(null)}
                className="pl-12 pr-4 py-6 bg-transparent border-none focus:ring-0 focus-visible:ring-0"
                required
              />
            </div>
          </div>
        </div>

        {mode === "signup" && (
          <div className="space-y-3">
            <Label htmlFor="github-email" className="text-gray-700 ml-1">
              GitHub 이메일 (선택사항)
            </Label>
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
                <Input
                  id="github-email"
                  type="email"
                  placeholder="username@github.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setIsFocused("email")}
                  onBlur={() => setIsFocused(null)}
                  className="pl-12 pr-4 py-6 bg-transparent border-none focus:ring-0 focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5]/10 to-[#10B981]/10 rounded-xl blur-xl" />
          <div className="relative bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-5">
            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />
              {mode === "login" ? "로그인 진행" : "가입 진행"}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#10B981]" />
                GitHub 계정 확인
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#10B981]" />
                {mode === "signup"
                  ? "이메일로 보안 코드 발송"
                  : "등록된 이메일로 보안 코드 발송"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#10B981]" />
                보안 코드 입력 및 {mode === "login" ? "로그인" : "가입 완료"}
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading || !githubId}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 
                       hover:from-gray-900 hover:to-black text-white py-6 rounded-xl
                       shadow-lg shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-900/40
                       transition-all duration-300 hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  확인 중...
                </>
              ) : (
                <>
                  다음 단계
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </span>
            <div
              className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 
                            transition-transform duration-300"
            />
          </Button>

          <Button
            type="button"
            onClick={onBack}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 py-6 rounded-xl
                       transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            다른 방법으로 {mode === "login" ? "로그인" : "가입"}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
