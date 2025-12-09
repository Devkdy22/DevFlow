import { motion } from "motion/react";
import { Github } from "lucide-react";

interface GitHubAuthProps {
  mode?: "login" | "signup";
}

export function GitHubAuth({ mode = "login" }: GitHubAuthProps) {
  console.log("✅ VITE_API_URL =", import.meta.env.VITE_API_URL);
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
          <h2 className="text-gray-900 font-semibold text-lg">
            GitHub {mode === "login" ? "로그인" : "회원가입"}
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            GitHub 계정을 이용해 빠르게 {mode === "login" ? "로그인" : "가입"}
            하세요
          </p>
        </motion.div>
      </div>

      {/* OAuth Button */}
      <motion.button
        type="button"
        onClick={() => {
          const url = `${
            import.meta.env.VITE_API_URL
          }/api/auth/github?mode=${mode}`;
          window.location.href = url;
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="
          w-full relative group overflow-hidden 
          bg-gradient-to-r from-gray-800 to-gray-900 
          hover:from-black hover:to-gray-900
          text-white py-6 rounded-xl
          shadow-lg shadow-gray-900/25 
          hover:shadow-xl hover:shadow-gray-900/40
          transition-all duration-300
        "
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <Github className="h-5 w-5" />
          GitHub로 {mode === "login" ? "로그인" : "회원가입"}
        </span>

        <div
          className="absolute inset-0 bg-white/10 translate-y-full 
                     group-hover:translate-y-0 transition-transform duration-300"
        />
      </motion.button>

      {/* Info Box */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5]/10 to-[#10B981]/10 blur-xl rounded-xl" />
        <div className="relative bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 text-sm">
          <p className="text-gray-600">
            🔐 GitHub OAuth를 통해 안전하게 인증을 진행합니다.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
