import { useState, useEffect } from "react";
import axios from "axios";
import { LandingPage } from "./pages/LandingPage";
import { LoginForm } from "./pages/LoginForm";
import { SignupForm } from "./pages/SignupForm";
import { ForgotPassword } from "./pages/ForgotPassword";
import { GitHubAuth } from "./pages/GitHubAuth";
import { ResetPassword } from "./pages/ResetPassword";
import { Dashboard } from "./pages/Dashboard";
import { ProjectForm } from "./pages/ProjectForm";
import { Schedule } from "./pages/Schedule";
import { Retrospective } from "./pages/Retrospective";
import { TaskBoard } from "./pages/TaskBoard";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { CodeRain } from "./components/CodeRain";
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
import {
  sendResetPasswordMail,
  initiateGitHubAuth,
  handleGitHubCallback,
} from "./services/auth";

type Page =
  | "landing"
  | "auth"
  | "dashboard"
  | "projects"
  | "tasks"
  | "schedule"
  | "retrospective";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [authMode, setAuthMode] = useState<
    | null
    | "forgot-password"
    | "reset-password"
    | "github-login"
    | "github-signup"
  >(null);
  const [resetToken, setResetToken] = useState<string>("");
  const [, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // URL에서 토큰 파라미터 확인 (비밀번호 재설정 링크)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset_token");
    const ghCode = params.get("code");
    const ghState = params.get("state");

    if (token) {
      setResetToken(token);
      setAuthMode("reset-password");
      setCurrentPage("auth");
      // URL 정리
      window.history.replaceState({}, "", window.location.pathname);
    }

    // GitHub OAuth 콜백 처리
    if (ghCode && ghState) {
      handleGitHubAuthCallback(ghCode, ghState);
    }
  }, []);

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentPage("landing");
  };

  // 로그인 핸들러: API 호출, 토큰 저장
  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const token = res.data?.token;
      if (!token) throw new Error("로그인에 실패했습니다. 토큰이 없습니다.");
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      setCurrentPage("dashboard");
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
      // const res =
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
        ...(github ? { githubId: github } : {}),
      });
      // ✅ 회원가입 성공 메시지 표시
      alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      // ✅ 로그인 탭으로 전환 (토큰 저장하지 않음)
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

  /*추가 코드 시작*/
  // 비밀번호 찾기 핸들러
  const handleForgotPassword = async (email: string) => {
    try {
      // 보안상, 이메일 존재 유무를 노출하지 않음 — 항상 200/성공 메시지 반환 처리 권장
      await sendResetPasswordMail(email);
      // UI: ForgotPassword 컴포넌트는 성공 시 자체적으로 메시지 표시하므로 여기선 authMode 초기화만
      setAuthMode(null);
      setActiveTab("login");
      // 또는 다른 UX 원하면 setAuthMode(null) 대신 성공 화면 리다이렉트 등
    } catch (err) {
      // 네트워크/서버 오류는 사용자에게 보여줄 수 있음
      console.error(err);
      // throw 또는 toast 표시 (ForgotPassword가 catch 하도록 throw)
      throw err;
    }
  };
  // 비밀번호 재설정 성공 핸들러
  const handleResetPasswordSuccess = () => {
    alert("비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.");
    setAuthMode(null);
    setActiveTab("login");
  };

  // GitHub 인증 시작
  const handleGitHubInitialSubmit = async (mode: "login" | "signup") => {
    try {
      const { authUrl } = await initiateGitHubAuth(mode);
      // GitHub 인증 페이지로 리다이렉트
      window.location.href = authUrl;
    } catch (error) {
      console.error("GitHub 인증 시작 실패:", error);
      alert("GitHub 인증을 시작할 수 없습니다.");
    }
  };

  // GitHub OAuth 콜백 처리
  const handleGitHubAuthCallback = async (code: string, state: string) => {
    try {
      const { token, user } = await handleGitHubCallback(code, state);
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      setCurrentPage("dashboard");

      alert(`환영합니다, ${user.name}님!`);
    } catch (error) {
      console.error("GitHub 인증 실패:", error);
      alert("GitHub 인증에 실패했습니다.");
      setCurrentPage("auth");
    }
  };

  /*추가 코드 끝*/

  const handleGetStarted = () => {
    setCurrentPage("auth");
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: "대시보드", page: "dashboard" as Page },
    { icon: FolderKanban, label: "태스크 보드", page: "tasks" as Page },
    { icon: Calendar, label: "일정 관리", page: "schedule" as Page },
    { icon: FileText, label: "프로젝트 회고", page: "retrospective" as Page },
  ];

  // Landing Page
  if (currentPage === "landing") {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Auth Page
  if (currentPage === "auth") {
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
        <AnimatedBackground />

        {/* Code Rain Effect */}
        <CodeRain />

        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setCurrentPage("landing")}
              className="text-white hover:bg-white/10 mb-6"
            >
              ← 돌아가기
            </Button>

            {/* Glass Card */}
            <div className="relative group">
              {/* Glow Effect */}
              <div className=" absolute -inset-1 bg-gradient-to-r from-[#4F46E5] to-[#10B981] rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500" />

              {/* Main Card */}
              <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden  ">
                {/* Logo */}
                <div className="flex flex-col items-center pt-10 pb-6 px-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#10B981] rounded-2xl blur-lg opacity-50" />
                    <div className="relative bg-gradient-to-br from-[#4F46E5] to-[#4338CA] p-3 rounded-2xl">
                      <Code2 className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <h1 className="font-bold mt-4 bg-gradient-to-r from-[#4F46E5] to-[#10B981] bg-clip-text text-transparent">
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
                        setAuthMode(null); // GitHub / 비밀번호찾기 초기화}
                      }}
                      className={`
                      flex-1 py-5 text-center transition-all duration-300 relative
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
                        setAuthMode(null); // GitHub / 비밀번호찾기 초기화
                      }}
                      className={`
                      flex-1 py-5 text-center transition-all duration-300 relative
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
                    <h2 className="text-gray-900 mb-2 font-bold">
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

                  {/* Animated Form Transition */}
                  {/* <div className="relative">
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
                  </div> */}
                  {/* Form Content */}
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
                    {authMode === "github-login" && (
                      <GitHubAuth
                        mode="login"
                        onInitialSubmit={() =>
                          handleGitHubInitialSubmit("login")
                        }
                        onVerification={async () => {}}
                        onSuccess={() => {}}
                        onBack={() => setAuthMode(null)}
                      />
                    )}
                    {/* GitHub 회원가입 */}
                    {authMode === "github-signup" && (
                      <GitHubAuth
                        mode="signup"
                        onInitialSubmit={() =>
                          handleGitHubInitialSubmit("signup")
                        }
                        onVerification={async () => {}}
                        onSuccess={() => {}}
                        onBack={() => setAuthMode(null)}
                      />
                    )}
                    {/* ✅ 기본 로그인 / 회원가입 */}
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
                              onGitHubSignup={() =>
                                setAuthMode("github-signup")
                              }
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Authenticated Pages with Navigation
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigateToPage("dashboard")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#10B981] rounded-xl blur-md opacity-50" />
                <div className="relative bg-gradient-to-br from-[#4F46E5] to-[#4338CA] p-2 rounded-xl">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#10B981] bg-clip-text text-transparent">
                DevFlow
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navigationItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => navigateToPage(item.page)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      currentPage === item.page
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
                    key={item.page}
                    onClick={() => navigateToPage(item.page)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${
                        currentPage === item.page
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
      {currentPage === "dashboard" && (
        <Dashboard onNavigate={navigateToPage as (page: string) => void} />
      )}
      {currentPage === "projects" && (
        <ProjectForm onBack={() => navigateToPage("dashboard")} />
      )}
      {currentPage === "tasks" && (
        <TaskBoard onBack={() => navigateToPage("dashboard")} />
      )}
      {currentPage === "schedule" && (
        <Schedule onBack={() => navigateToPage("dashboard")} />
      )}
      {currentPage === "retrospective" && (
        <Retrospective onBack={() => navigateToPage("dashboard")} />
      )}
    </div>
  );
}
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
