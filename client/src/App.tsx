import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import axios from "axios";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import {
  Code2,
  LayoutDashboard,
  FolderKanban,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { sendResetPasswordMail, handleGitHubCallback } from "./services/auth";

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

const AUTH_TOKEN_KEY = "accessToken";

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500/70 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Axios Authorization 헤더 설정
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem(
  AUTH_TOKEN_KEY
)}`;

// ✅ 보호된 라우트 컴포넌트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// ✅ 인증 페이지 래퍼 (이미 로그인된 경우 대시보드로)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// ✅ 레이아웃 컴포넌트 (네비게이션 바 포함)
function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    navigate("/");
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: "대시보드", path: "/dashboard" },
    { icon: FolderKanban, label: "태스크 보드", path: "/tasks" },
    { icon: Calendar, label: "일정 관리", path: "/schedule" },
    { icon: FileText, label: "프로젝트 회고", path: "/retrospective" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#10B981] rounded-xl blur-md opacity-50" />
                <div className="relative bg-gradient-to-br from-[#4F46E5] to-[#4338CA] p-2 rounded-xl">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#10B981] bg-clip-text text-transparent font-bold text-xl">
                DevFlow
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navigationItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                {navigationItems.map(item => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${
                        location.pathname === item.path
                          ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-5 w-5" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
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
      localStorage.setItem(AUTH_TOKEN_KEY, githubToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${githubToken}`;
      navigate("/dashboard");
      return;
    }

    // GitHub OAuth 코드 방식 처리
    if (ghCode && ghState) {
      handleGitHubAuthCallback(ghCode, ghState);
      return;
    }
  }, [location.search, navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const token = res.data?.token;

      if (!token) throw new Error("로그인 실패");

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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

  const handleGitHubAuthCallback = async (code: string, state: string) => {
    try {
      const { token, user } = await handleGitHubCallback(code, state);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      navigate("/dashboard");
      alert(`환영합니다, ${user.name}님!`);
    } catch (error) {
      console.error("GitHub 인증 실패:", error);
      alert("GitHub 인증에 실패했습니다.");
    }
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
                    {activeTab === "login"
                      ? "다시 오신 것을 환영합니다"
                      : "새로운 여정을 시작하세요"}
                  </h2>
                  <p className="text-gray-600">
                    {activeTab === "login"
                      ? "계정에 로그인하여 프로젝트를 관리하세요"
                      : "개발자를 위한 프로젝트 관리를 시작하세요"}
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

// ✅ 메인 App 컴포넌트
function AppContent() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // 인증 상태 확인
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
          element={<LandingPage onGetStarted={() => navigate("/auth")} />}
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectForm />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TaskBoard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Schedule />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/retrospective"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Retrospective />
              </AppLayout>
            </ProtectedRoute>
          }
        />

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
