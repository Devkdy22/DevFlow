import { Moon, Sun } from "lucide-react";
import { useTheme } from "./../hooks/useTheme";
import { motion } from "motion/react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 border border-slate-300 dark:border-slate-500 shadow-inner transition-all duration-300 hover:shadow-lg"
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center"
        animate={{ x: theme === "dark" ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {theme === "light" ? (
          <Sun className="h-3.5 w-3.5 text-yellow-500" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-blue-400" />
        )}
      </motion.div>
    </button>
  );
}
