import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import axios from "axios";

interface ForgotPasswordProps {
  onSubmit: (email: string) => Promise<void> | void;
  onBack: () => void;
}

export function ForgotPassword({ onBack, onSubmit }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // 실제 API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500));

    // setIsLoading(false);
    // setIsSubmitted(true);
    try {
      await onSubmit(email); // ✅ 실제 API 호출
      setIsSubmitted(true); // ✅ 성공 시 전환
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "이메일 전송 중 문제가 발생했습니다."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("이메일 전송 중 문제가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
          }}
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
          transition={{ delay: 0.3 }}
          className="text-center space-y-3"
        >
          <h2 className="text-gray-900">이메일을 확인해주세요</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              비밀번호 재설정 링크를 다음 주소로 전송했습니다:
            </p>
            <p className="text-[#4F46E5] font-medium bg-[#4F46E5]/5 py-2 px-4 rounded-lg inline-block">
              {email}
            </p>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5]/10 to-[#10B981]/10 rounded-xl blur-xl" />
          <div className="relative bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 링크는 24시간 동안 유효합니다</p>
                <p>• 이메일이 오지 않았다면 스팸 폴더를 확인해주세요</p>
                <p>• 여전히 문제가 있다면 다시 시도해주세요</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            onClick={onBack}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-[#4F46E5] to-[#4338CA] 
                       hover:from-[#4338CA] hover:to-[#3730A3] text-white py-6 rounded-xl
                       shadow-lg shadow-[#4F46E5]/25 hover:shadow-xl hover:shadow-[#4F46E5]/40
                       transition-all duration-300 hover:scale-[1.02]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              로그인으로 돌아가기
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div
              className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 
                            transition-transform duration-300"
            />
          </Button>

          <Button
            onClick={() => setIsSubmitted(false)}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 py-6 rounded-xl
                       transition-all duration-300"
          >
            이메일을 다시 전송
          </Button>
        </motion.div>
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
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-gray-900">비밀번호를 잊으셨나요?</h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600"
        >
          가입하신 이메일 주소를 입력하시면
          <br />
          비밀번호 재설정 링크를 보내드립니다
        </motion.p>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="space-y-3">
          <Label htmlFor="forgot-email" className="text-gray-700 ml-1">
            이메일 주소
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
              absolute inset-0 bg-gradient-to-r from-[#4F46E5]/20 to-[#10B981]/20 rounded-xl blur-xl
              transition-opacity duration-300
              ${isFocused ? "opacity-100" : "opacity-0"}
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
                ${isFocused ? "text-[#4F46E5]" : "text-gray-400"}
              `}
              />
              <Input
                id="forgot-email"
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="pl-12 pr-4 py-6 bg-transparent border-none focus:ring-0 focus-visible:ring-0"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-[#4F46E5] to-[#4338CA] 
                       hover:from-[#4338CA] hover:to-[#3730A3] text-white py-6 rounded-xl
                       shadow-lg shadow-[#4F46E5]/25 hover:shadow-xl hover:shadow-[#4F46E5]/40
                       transition-all duration-300 hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  전송 중...
                </>
              ) : (
                <>
                  재설정 링크 전송
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
            onClick={onBack}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 py-6 rounded-xl
                       transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            로그인으로 돌아가기
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
