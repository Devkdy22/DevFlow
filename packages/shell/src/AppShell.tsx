import { ChevronUp, Code2, LogOut } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { NavigationItem } from "@devflow/navigation";

type AppShellProps = {
  children: ReactNode;
  navigationItems: NavigationItem[];
  onLogout: () => void;
  brandName?: string;
  onBrandClickPath?: string;
  rightSlot?: ReactNode;
};

export function AppShell({
  children,
  navigationItems,
  onLogout,
  brandName = "DevFlow",
  onBrandClickPath = "/dashboard",
  rightSlot,
}: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
        document.body.scrollTop
      );
      setShowScrollTop(y > 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      <header className="fixed inset-x-0 top-0 z-[9998] px-3 pt-3 md:px-5 md:pt-4">
        <div className="mx-auto w-full max-w-[1600px] rounded-[24px] border border-white/20 bg-slate-950/78 px-4 py-3 shadow-[0_20px_44px_rgba(2,6,23,0.42)] backdrop-blur-2xl md:px-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate(onBrandClickPath)}
              className="group inline-flex items-center gap-3 transition-transform duration-300 hover:scale-[1.015]"
            >
              <div className="inline-flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#4338CA] text-white shadow-[0_10px_24px_rgba(79,70,229,0.36)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                  <Code2 className="h-6 w-6" />
                </span>
                <span className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#10B981] bg-clip-text text-[30px] font-extrabold tracking-tight text-transparent transition-opacity duration-300 group-hover:opacity-90 md:text-[34px]">
                  {brandName}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="inline-flex">{rightSlot}</div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300/35 bg-white/10 px-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/16 active:translate-y-0 active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-white/12 pt-3">
            {navigationItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] md:text-[15px] ${
                    isActive
                      ? "border-white/80 bg-white text-slate-900 shadow-[0_8px_22px_rgba(255,255,255,0.24)]"
                      : "border-slate-300/35 bg-white/8 text-white hover:bg-white/16"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="relative pt-[198px] md:pt-[216px]">{children}</main>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="맨 위로 이동"
        className={`fixed bottom-8 right-8 z-[9999] inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300/30 bg-slate-900/84 text-white transition-all duration-200 ${
          showScrollTop
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 translate-y-3"
        }`}
      >
        <ChevronUp className="h-6 w-6" />
      </button>
    </div>
  );
}
