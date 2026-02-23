import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "./../hooks/useTheme";
import { motion } from "motion/react";

export function ThemeToggle() {
  const { theme, themeMode, toggleTheme } = useTheme();

  const modeLabel =
    themeMode === "light" ? "라이트" : themeMode === "dark" ? "다크" : "시스템";

  return (
    <button
      onClick={toggleTheme}
      title={`테마: ${modeLabel} (클릭 시 변경)`}
      className="relative inline-flex h-11 w-[70px] items-center rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(235,246,255,0.82))] px-1.5 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_14px_28px_rgba(59,130,246,0.18),0_8px_18px_rgba(15,23,42,0.08)] ring-1 ring-white backdrop-blur-2xl transition-all duration-220 hover:-translate-y-0.5 hover:scale-[1.04] hover:bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(224,241,255,0.92))] active:translate-y-0 active:scale-[0.98] dark:bg-white/14 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_12px_24px_rgba(2,6,23,0.34)] dark:ring-white/22 dark:hover:bg-white/24"
    >
      <motion.div
        className="absolute top-1 left-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_rgba(15,23,42,0.22)] dark:bg-slate-900 md:h-9 md:w-9"
        animate={{
          x: themeMode === "light" ? 0 : themeMode === "dark" ? 14 : 22,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {themeMode === "system" ? (
          <Laptop className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300" />
        ) : theme === "light" ? (
          <Sun className="h-3.5 w-3.5 text-yellow-500" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-blue-400" />
        )}
      </motion.div>
    </button>
  );
}
