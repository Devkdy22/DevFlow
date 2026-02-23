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
      className="relative inline-flex h-12 w-[76px] items-center rounded-full border border-white/85 bg-white/70 px-1.5 text-foreground shadow-[0_14px_28px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[0.98] dark:border-white/35 dark:bg-white/14 dark:text-slate-100 dark:shadow-[0_14px_30px_rgba(2,6,23,0.34)] dark:hover:bg-white/22"
    >
      <motion.div
        className="absolute top-1 left-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_rgba(15,23,42,0.22)] dark:bg-slate-900 md:h-10 md:w-10"
        animate={{
          x: themeMode === "light" ? 0 : themeMode === "dark" ? 18 : 30,
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
