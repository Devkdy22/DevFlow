import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import axios from "axios";
import { LayoutGroup, motion } from "motion/react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Code2, LogOut } from "lucide-react";
import { Button } from "./components/ui/button";
import { sendResetPasswordMail, handleGitHubCallback } from "./services/auth";
import { APP_NAVIGATION } from "@devflow/navigation";
import { PageTransition } from "@devflow/motion";
import {
  applyAuthHeader,
  clearAuthToken,
  persistAuthToken,
  readValidAuthToken,
} from "@devflow/core";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "./hooks/useTheme";

const LandingPage = lazy(() =>
  import("./pages/LandingPage").then(m => ({ default: m.LandingPage })),
);
const LoginForm = lazy(() =>
  import("./pages/LoginForm").then(m => ({ default: m.LoginForm })),
);
const SignupForm = lazy(() =>
  import("./pages/SignupForm").then(m => ({ default: m.SignupForm })),
);
const ForgotPassword = lazy(() =>
  import("./pages/ForgotPassword").then(m => ({ default: m.ForgotPassword })),
);
const GitHubAuth = lazy(() =>
  import("./pages/GitHubAuth").then(m => ({ default: m.GitHubAuth })),
);
const ResetPassword = lazy(() =>
  import("./pages/ResetPassword").then(m => ({ default: m.ResetPassword })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then(m => ({ default: m.Dashboard })),
);
const ProjectForm = lazy(() =>
  import("./pages/ProjectForm").then(m => ({ default: m.ProjectForm })),
);
const Schedule = lazy(() =>
  import("./pages/Schedule").then(m => ({ default: m.Schedule })),
);
const Retrospective = lazy(() =>
  import("./pages/Retrospective").then(m => ({ default: m.Retrospective })),
);
const TaskBoard = lazy(() =>
  import("./pages/TaskBoard").then(m => ({ default: m.TaskBoard })),
);
const AnimatedBackground = lazy(() =>
  import("./components/AnimatedBackground").then(m => ({
    default: m.AnimatedBackground,
  })),
);
const CodeRain = lazy(() =>
  import("./components/CodeRain").then(m => ({ default: m.CodeRain })),
);

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500/70 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Axios Authorization 헤더 설정
applyAuthHeader(axios.defaults.headers.common, readValidAuthToken(localStorage));

// ✅ 보호된 라우트 컴포넌트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = readValidAuthToken(localStorage);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// ✅ 인증 페이지 래퍼 (이미 로그인된 경우 대시보드로)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = readValidAuthToken(localStorage);
  const forceAuthPage = new URLSearchParams(location.search).get("force") === "1";

  if (token && !forceAuthPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// ✅ 인증 페이지 컴포넌트
function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [authMode, setAuthMode] = useState<
    | null
    | "forgot-password"
    | "reset-password"
    | "github-login"
    | "github-signup"
  >(null);
  const [resetToken, setResetToken] = useState<string>("");

  const handleGitHubAuthCallback = useCallback(
    async (code: string, state: string) => {
      try {
        const { token, user } = await handleGitHubCallback(code, state);
        persistAuthToken(localStorage, token);
        applyAuthHeader(axios.defaults.headers.common, token);
        navigate("/dashboard");
        alert(`환영합니다, ${user.name}님!`);
      } catch (error) {
        console.error("GitHub 인증 실패:", error);
        alert("GitHub 인증에 실패했습니다.");
      }
    },
    [navigate]
  );

  // URL 파라미터 처리
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get("reset_token");
    const githubToken = params.get("token");
    const ghCode = params.get("code");
    const ghState = params.get("state");

    // 비밀번호 재설정
    if (resetToken) {
      setResetToken(resetToken);
      setAuthMode("reset-password");
      window.history.replaceState({}, "", "/auth");
      return;
    }

    // GitHub 로그인 완료 (JWT 토큰 방식)
    if (githubToken) {
      persistAuthToken(localStorage, githubToken);
      applyAuthHeader(axios.defaults.headers.common, githubToken);
      navigate("/dashboard");
      return;
    }

    // GitHub OAuth 코드 방식 처리
    if (ghCode && ghState) {
      handleGitHubAuthCallback(ghCode, ghState);
      return;
    }
  }, [location.search, navigate, handleGitHubAuthCallback]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const token = res.data?.token;

      if (!token) throw new Error("로그인 실패");

      persistAuthToken(localStorage, token);
      applyAuthHeader(axios.defaults.headers.common, token);
      navigate("/dashboard");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "로그인 실패");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("로그인 실패 — 알 수 없는 오류");
      }
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    github: string
  ) => {
    try {
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
        ...(github ? { githubId: github } : {}),
      });
      alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      setActiveTab("login");
      setAuthMode(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "회원가입 실패");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("회원가입 실패 — 알 수 없는 오류");
      }
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await sendResetPasswordMail(email);
      setAuthMode(null);
      setActiveTab("login");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleResetPasswordSuccess = () => {
    alert("비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.");
    setAuthMode(null);
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0b14]">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(79, 70, 229, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(79, 70, 229, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Dot Pattern Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(79, 70, 229, 0.15) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800/95 to-slate-900" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#4F46E5]/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[#10B981]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Particle Network */}
      <Suspense fallback={null}>
        <AnimatedBackground />
      </Suspense>

      {/* Code Rain Effect */}
      <Suspense fallback={null}>
        <CodeRain />
      </Suspense>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10 mb-6"
          >
            ← 돌아가기
          </Button>

          {/* Glass Card */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#4F46E5] to-[#10B981] rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500" />

            {/* Main Card */}
            <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
              {/* Logo */}
              <div className="flex flex-col items-center pt-10 pb-6 px-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#10B981] rounded-2xl blur-lg opacity-50" />
                  <div className="relative bg-gradient-to-br from-[#4F46E5] to-[#4338CA] p-3 rounded-2xl">
                    <Code2 className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h1 className="font-bold mt-4 text-2xl bg-gradient-to-r from-[#4F46E5] to-[#10B981] bg-clip-text text-transparent">
                  DevFlow
                </h1>
              </div>

              {/* Tabs */}
              {authMode !== "reset-password" && (
                <div className="relative flex border-b border-gray-200/50 bg-gray-50/30 backdrop-blur-sm">
                  <div
                    className={`
                      absolute bottom-0 h-0.5 bg-gradient-to-r from-[#4F46E5] to-[#10B981]
                      transition-all duration-300 ease-out
                      ${
                        activeTab === "login"
                          ? "left-0 w-1/2"
                          : "left-1/2 w-1/2"
                      }
                    `}
                  />
                  <button
                    onClick={() => {
                      setActiveTab("login");
                      setAuthMode(null);
                    }}
                    className={`
                      flex-1 py-5 text-center transition-all duration-300 relative font-medium
                      ${
                        activeTab === "login"
                          ? "text-[#4F46E5]"
                          : "text-gray-500 hover:text-gray-700"
                      }
                    `}
                  >
                    <span className="relative z-10">로그인</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("signup");
                      setAuthMode(null);
                    }}
                    className={`
                      flex-1 py-5 text-center transition-all duration-300 relative font-medium
                      ${
                        activeTab === "signup"
                          ? "text-[#10B981]"
                          : "text-gray-500 hover:text-gray-700"
                      }
                    `}
                  >
                    <span className="relative z-10">회원가입</span>
                  </button>
                </div>
              )}

              {/* Form Content */}
              <div className="p-8 lg:p-10">
                <div className="mb-8">
                  <h2 className="text-gray-900 mb-2 font-bold text-xl">
                    다시 오신 것을 환영합니다
                  </h2>
                  <p className="text-gray-600">
                    계정에 로그인하거나 회원가입하여 프로젝트를 관리하세요
                  </p>
                </div>

                {/* Form Content */}
                <Suspense
                  fallback={
                    <div className="py-10 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-indigo-500/70 border-t-transparent rounded-full animate-spin" />
                    </div>
                  }
                >
                  <div className="relative">
                  {/* 비밀번호 재설정 */}
                  {authMode === "reset-password" && (
                    <ResetPassword
                      token={resetToken}
                      onSuccess={handleResetPasswordSuccess}
                      onBack={() => {
                        setAuthMode(null);
                        setActiveTab("login");
                      }}
                    />
                  )}

                  {/* 비밀번호 찾기 */}
                  {authMode === "forgot-password" && (
                    <ForgotPassword
                      onSubmit={handleForgotPassword}
                      onBack={() => setAuthMode(null)}
                    />
                  )}

                  {/* GitHub 로그인 */}
                  {authMode === "github-login" && <GitHubAuth mode="login" />}

                  {/* GitHub 회원가입 */}
                  {authMode === "github-signup" && <GitHubAuth mode="signup" />}

                  {/* 기본 로그인 / 회원가입 */}
                  {authMode === null && (
                    <>
                      {activeTab === "login" ? (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                          <LoginForm
                            onSubmit={handleLogin}
                            onGoSignup={() => setActiveTab("signup")}
                            onForgotPassword={() =>
                              setAuthMode("forgot-password")
                            }
                            onGitHubLogin={() => setAuthMode("github-login")}
                          />
                        </div>
                      ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                          <SignupForm
                            onSubmit={handleSignup}
                            onGitHubSignup={() => setAuthMode("github-signup")}
                            onGoLogin={() => setActiveTab("login")}
                          />
                        </div>
                      )}
                    </>
                  )}
                  </div>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PROTECTED_ROUTES: Array<{
  path: string;
  Component: React.ComponentType;
}> = [
  { path: "/dashboard", Component: Dashboard },
  { path: "/projects", Component: ProjectForm },
  { path: "/projects/:id", Component: ProjectForm },
  { path: "/tasks", Component: TaskBoard },
  { path: "/schedule", Component: Schedule },
  { path: "/retrospective", Component: Retrospective },
];

function StableShell({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [headerVisible, setHeaderVisible] = useState(true);
  const [hoveredNavPath, setHoveredNavPath] = useState<string | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const threshold = 8;
    const topThreshold = 24;

    const showTemporarily = () => {
      setHeaderVisible(true);
      clearHideTimer();
      if (window.scrollY > topThreshold) {
        hideTimerRef.current = window.setTimeout(() => {
          setHeaderVisible(false);
          hideTimerRef.current = null;
        }, 3000);
      }
    };

    const onScroll = () => {
      const y = window.scrollY;

      if (y <= topThreshold) {
        clearHideTimer();
        setHeaderVisible(true);
      } else if (y > lastY + threshold) {
        clearHideTimer();
        setHeaderVisible(false);
      } else if (y < lastY - threshold) {
        showTemporarily();
      }

      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearHideTimer();
    };
  }, [clearHideTimer]);

  useEffect(() => {
    setHeaderVisible(true);
    clearHideTimer();
    if (window.scrollY > 24) {
      hideTimerRef.current = window.setTimeout(() => {
        setHeaderVisible(false);
        hideTimerRef.current = null;
      }, 3000);
    }
  }, [location.pathname, clearHideTimer]);

  const isDark = theme === "dark";
  const normalizedPath =
    location.pathname.replace(/\/+$/, "") === ""
      ? "/"
      : location.pathname.replace(/\/+$/, "");
  const activeNavPath =
    APP_NAVIGATION.find(item => {
      const normalizedItemPath =
        item.path.replace(/\/+$/, "") === ""
          ? "/"
          : item.path.replace(/\/+$/, "");
      return (
        normalizedPath === normalizedItemPath ||
        normalizedPath.startsWith(`${normalizedItemPath}/`)
      );
    })?.path ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 text-foreground dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header
        className={`fixed inset-x-0 top-0 z-[2147483000] px-3 pt-3 transition-all duration-300 md:px-5 md:pt-4 ${
          headerVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-[112%] opacity-0"
        }`}
      >
        <div
          className={`mx-auto w-full max-w-[1600px] rounded-[30px] px-4 py-3 backdrop-blur-3xl md:px-6 ${
            isDark
              ? "bg-slate-900/48 shadow-[0_24px_48px_rgba(2,6,23,0.42)] ring-1 ring-white/12"
              : "bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(244,248,255,0.76)_42%,rgba(236,246,255,0.68))] shadow-[0_26px_52px_rgba(59,130,246,0.16),0_18px_38px_rgba(15,23,42,0.14)] ring-1 ring-white/95"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="group inline-flex items-center gap-3"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#4338CA] text-white shadow-[0_10px_24px_rgba(79,70,229,0.36)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                <Code2 className="h-6 w-6" />
              </span>
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#10B981] bg-clip-text text-[30px] font-extrabold tracking-tight text-transparent md:text-[34px]">
                DevFlow
              </span>
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />
              <button
                type="button"
                onClick={onLogout}
                className={`inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-all duration-220 hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] ${
                  isDark
                    ? "bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_10px_20px_rgba(0,0,0,0.22)] ring-1 ring-white/22 hover:bg-white/24"
                    : "bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,248,255,0.78))] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_14px_28px_rgba(59,130,246,0.18),0_10px_20px_rgba(15,23,42,0.1)] ring-1 ring-white hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(233,245,255,0.9))]"
                }`}
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <LayoutGroup id="header-nav-glass">
              {APP_NAVIGATION.map(item => {
                const isActive = activeNavPath === item.path;
                const isHovered = hoveredNavPath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setHoveredNavPath(item.path)}
                    onMouseLeave={() => setHoveredNavPath(null)}
                    onFocus={() => setHoveredNavPath(item.path)}
                    onBlur={() => setHoveredNavPath(null)}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative inline-flex isolate items-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold outline-none backdrop-blur-xl backdrop-saturate-150 transition-all duration-260 hover:-translate-y-0.5 hover:scale-[1.045] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-0 active:translate-y-0 active:scale-[0.985] md:text-[15px] ${
                      isActive
                        ? isDark
                          ? "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.58)] shadow-[0_22px_40px_rgba(2,6,23,0.42),0_12px_22px_rgba(59,130,246,0.2),0_6px_12px_rgba(15,23,42,0.24)]"
                          : "text-slate-800 [text-shadow:0_1px_1px_rgba(255,255,255,0.72)] shadow-[0_22px_42px_rgba(99,102,241,0.26),0_12px_24px_rgba(59,130,246,0.18),0_6px_14px_rgba(15,23,42,0.14)]"
                        : isDark
                          ? "text-slate-200/92 hover:text-white"
                          : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {isActive ? (
                      <>
                        {!isDark && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute -inset-x-12 -inset-y-8 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,rgba(59,130,246,0.16)_34%,rgba(148,163,184,0.12)_56%,transparent_78%)] opacity-85 blur-2xl"
                          />
                        )}
                        {isDark && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute -inset-x-10 -inset-y-7 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.24)_0%,rgba(99,102,241,0.2)_38%,rgba(2,6,23,0.24)_62%,transparent_82%)] opacity-80 blur-2xl"
                          />
                        )}
                        <span
                          aria-hidden
                          className={`pointer-events-none absolute inset-0 rounded-full ${
                            isDark
                              ? "bg-[linear-gradient(145deg,rgba(67,85,134,0.84),rgba(35,48,82,0.9)_48%,rgba(18,28,54,0.94))] shadow-[0_34px_58px_rgba(2,6,23,0.68),0_16px_30px_rgba(59,130,246,0.34),0_8px_18px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(167,180,215,0.42),inset_0_-12px_20px_rgba(2,6,23,0.42)] ring-1 ring-indigo-200/42"
                              : "bg-[linear-gradient(142deg,rgba(255,255,255,0.78),rgba(246,250,255,0.72)_30%,rgba(236,244,255,0.7)_54%,rgba(223,237,255,0.68))] shadow-[0_94px_132px_rgba(148,163,184,0.4),0_52px_86px_rgba(100,116,139,0.3),0_28px_48px_rgba(15,23,42,0.25),0_14px_24px_rgba(203,213,225,0.3),inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-16px_28px_rgba(148,163,184,0.12)] ring-[1.5px] ring-white/90"
                          }`}
                        />
                        <motion.span
                          layoutId="nav-glass-pill"
                          transition={{
                            type: "tween",
                            duration: 0.24,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          aria-hidden
                          className={`pointer-events-none absolute inset-0 rounded-full ${
                            isDark
                              ? "bg-[radial-gradient(circle_at_22%_9%,rgba(191,219,254,0.36),rgba(165,180,252,0.22)_30%,transparent_64%)] shadow-[inset_0_1px_0_rgba(191,219,254,0.28),inset_0_-12px_20px_rgba(15,23,42,0.42)]"
                              : "bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.96),rgba(241,245,249,0.62)_30%,rgba(226,232,240,0.28)_46%,transparent_70%)] shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-14px_24px_rgba(148,163,184,0.16)]"
                          }`}
                        />
                        {!isDark && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(115deg,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.18)_34%,rgba(255,255,255,0.06)_56%,rgba(226,232,240,0.2)_80%,rgba(255,255,255,0.5)_100%)] opacity-90 mix-blend-screen"
                          />
                        )}
                        {!isDark && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute -inset-x-10 -inset-y-6 rounded-full bg-[radial-gradient(circle,rgba(226,232,240,0.38)_0%,rgba(203,213,225,0.24)_42%,rgba(148,163,184,0.12)_58%,transparent_76%)] opacity-88 blur-xl"
                          />
                        )}
                      </>
                    ) : (
                      <motion.span
                        initial={false}
                        animate={{
                          scale: isHovered ? 1 : 0.78,
                          opacity: isHovered ? 1 : 0,
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        aria-hidden
                        className={`pointer-events-none absolute inset-0 rounded-full ${
                          isDark
                            ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.26),rgba(255,255,255,0.1))] ring-1 ring-white/30 shadow-[0_10px_22px_rgba(2,6,23,0.28)]"
                            : "bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(249,250,251,0.9)_44%,rgba(241,245,249,0.86))] ring-1 ring-white shadow-[0_44px_68px_rgba(148,163,184,0.48),0_24px_42px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.98)]"
                        }`}
                      />
                    )}

                    <item.icon
                      className={`relative z-10 h-4 w-4 shrink-0 opacity-100 ${
                        isActive
                          ? isDark
                            ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                            : "text-slate-700"
                          : ""
                      }`}
                    />
                    <span
                      className={`relative z-10 opacity-100 ${
                        isActive ? "font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </LayoutGroup>
          </div>
        </div>
      </header>

      <main className="relative pt-[198px] md:pt-[216px]">{children}</main>
    </div>
  );
}

// ✅ 메인 App 컴포넌트
function AppContent() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const handleLogout = () => {
    clearAuthToken(localStorage);
    applyAuthHeader(axios.defaults.headers.common, null);
    navigate("/");
  };

  useEffect(() => {
    // 인증 상태 확인
    const token = readValidAuthToken(localStorage);
    if (token) {
      applyAuthHeader(axios.defaults.headers.common, token);
    }
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-t-purple-500 border-b-purple-500 border-l-transparent border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={<LandingPage onGetStarted={() => navigate("/auth?force=1")} />}
        />

        {/* Auth Page */}
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <AuthPage />
            </AuthRoute>
          }
        />

        {/* Protected Routes with Layout */}
        {PROTECTED_ROUTES.map(({ path, Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                <StableShell onLogout={handleLogout}>
                  <PageTransition>
                    <Component />
                  </PageTransition>
                </StableShell>
              </ProtectedRoute>
            }
          />
        ))}

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
