import { motion } from "framer-motion";
import { ChevronUp, Code2, LogOut } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { NavigationItem } from "@devflow/navigation";
import { useGsapFloat } from "@devflow/motion";

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
  const logoRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useGsapFloat(logoRef, { amplitude: 4, duration: 2.6, autoLoadScript: true });

  useEffect(() => {
    let rafId = 0;
    let lastEventScrollTop = 0;

    const readScrollTop = () =>
      Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
        document.body.scrollTop,
        mainRef.current?.scrollTop ?? 0,
        lastEventScrollTop
      );

    const updateState = () => {
      const scrollTop = readScrollTop();
      const hideThreshold = Math.max(
        80,
        (headerRef.current?.offsetHeight ?? 120) - 8
      );
      const nextHeaderVisible = scrollTop <= hideThreshold;
      setIsHeaderVisible(nextHeaderVisible);
      // Header disappears only after threshold, so the arrow should be visible whenever header is hidden.
      setShowScrollTop(scrollTop > 0 || !nextHeaderVisible);
    };

    const onScroll = (event?: Event) => {
      const target = event?.target;
      if (target instanceof HTMLElement) {
        lastEventScrollTop = target.scrollTop;
      }
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateState();
      });
    };

    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const mainEl = mainRef.current;
    mainEl?.addEventListener("scroll", onScroll, { passive: true });
    const syncId = window.setInterval(updateState, 120);

    updateState();
    return () => {
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      mainEl?.removeEventListener("scroll", onScroll);
      window.clearInterval(syncId);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen text-foreground">
      <motion.header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-[70] px-4 pt-3 md:px-6 md:pt-4"
        initial={false}
        animate={{ y: isHeaderVisible ? 0 : -170 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        <motion.nav
          initial={{ y: -8, opacity: 0.96 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mx-auto w-full max-w-[1600px] bg-transparent shadow-none"
        >
          <div className="relative px-5 py-4 md:px-8 md:py-5 lg:px-10">
            <div className="relative z-10 flex items-start justify-between gap-4">
              <button
                type="button"
                className="group relative inline-flex items-center"
                onClick={() => navigate(onBrandClickPath)}
              >
                <div ref={logoRef} className="inline-flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#4338CA] text-white shadow-[0_8px_18px_rgba(79,70,229,0.38)] transition-transform duration-300 group-hover:scale-105 md:h-14 md:w-14 dark:from-indigo-500 dark:to-indigo-700">
                    <Code2 className="h-7 w-7 md:h-8 md:w-8" />
                  </span>
                  <span className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#10B981] bg-clip-text text-[34px] font-extrabold tracking-tight text-transparent md:text-[40px] dark:from-slate-100 dark:to-slate-300">
                    {brandName}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-3 md:gap-4">
                {rightSlot}
                <button
                  onClick={onLogout}
                  className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-white/55 px-4 text-sm font-semibold text-foreground shadow-[0_6px_16px_rgba(2,6,23,0.12)] transition-colors hover:bg-white/70 md:h-12 md:px-5 md:text-[15px] dark:bg-slate-800/72 dark:text-slate-100 dark:hover:bg-slate-700/82"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>

            <div className="relative z-10 mt-4 md:mt-5">
              <div className="flex justify-center">
              <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center justify-center gap-3 md:gap-4">
                    {navigationItems.map(item => {
                      const isActive = location.pathname === item.path;
                      return (
                        <motion.button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          aria-current={isActive ? "page" : undefined}
                          whileHover={{ y: -3, scale: 1.045 }}
                          whileTap={{ scale: 0.96, y: 0 }}
                          transition={{ type: "spring", stiffness: 420, damping: 24 }}
                          className={`group relative flex h-12 items-center gap-3 overflow-hidden rounded-2xl px-6 text-[16px] font-semibold transition-colors md:h-14 md:px-9 md:text-[18px] ${
                            isActive
                              ? "text-white dark:text-slate-900"
                              : "text-foreground hover:text-foreground dark:text-slate-100"
                          }`}
                        >
                          <motion.span
                            className={`absolute inset-0 rounded-xl ${
                              isActive
                                ? "bg-slate-900/86 dark:bg-slate-100"
                                : "bg-white/42 dark:bg-slate-700/62"
                            }`}
                            initial={false}
                            animate={{
                              opacity: isActive ? 1 : 0.92,
                              scale: isActive ? 1.01 : 0.99,
                            }}
                            whileHover={{
                              opacity: 1,
                              scale: 1.08,
                            }}
                            whileTap={{
                              scale: 0.95,
                            }}
                            transition={{ type: "spring", stiffness: 360, damping: 24 }}
                          />
                          <motion.span
                            aria-hidden
                            className="pointer-events-none absolute -left-8 top-0 h-full w-1/3 rounded-full bg-white/42 blur-[1px] dark:bg-white/20"
                            initial={false}
                            animate={{ opacity: isActive ? 0.95 : 0.72, x: isActive ? 10 : 0 }}
                            whileHover={{ opacity: 1, x: 16 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          />
                          <motion.span
                            aria-hidden
                            className="pointer-events-none absolute right-2 top-1 h-3 w-8 rounded-full bg-white/56 dark:bg-white/25"
                            initial={false}
                            animate={{ opacity: isActive ? 0.8 : 0.5 }}
                            whileHover={{ opacity: 0.95, scale: 1.06 }}
                            transition={{ duration: 0.2 }}
                          />
                          <item.icon className="relative z-10 h-5 w-5 md:h-[22px] md:w-[22px]" />
                          <motion.span
                            className="relative z-10 whitespace-nowrap"
                            initial={false}
                            animate={{ scale: isActive ? 1.03 : 1 }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 420, damping: 22 }}
                          >
                            {item.label}
                          </motion.span>
                        </motion.button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </motion.nav>
      </motion.header>

      <main
        ref={mainRef}
        className="relative -mt-[132px] pt-[132px] md:-mt-[148px] md:pt-[148px]"
      >
        {children}
      </main>

      <motion.button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        initial={false}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.85,
          y: showScrollTop ? 0 : 16,
        }}
        className={`fixed bottom-8 right-8 z-[99999] inline-flex h-14 w-14 items-center justify-center rounded-full text-slate-900 shadow-[0_18px_40px_rgba(2,6,23,0.34)] transition-colors dark:text-white ${
          showScrollTop
            ? "pointer-events-auto bg-white/92 hover:bg-white dark:bg-slate-800/92 dark:hover:bg-slate-700"
            : "pointer-events-none bg-white/0 dark:bg-slate-800/0"
        }`}
        aria-label="맨 위로 이동"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
      >
        <ChevronUp className="h-7 w-7" />
      </motion.button>
    </div>
  );
}
