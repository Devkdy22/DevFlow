import { AnimatePresence, motion } from "framer-motion";
import { Code2, LogOut, Menu, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  useGsapFloat(logoRef, { amplitude: 5, duration: 2.8, autoLoadScript: true });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="bg-background/90 backdrop-blur-xl border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(onBrandClickPath)}
            >
              <div className="relative" ref={logoRef}>
                <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#10B981] rounded-xl blur-md opacity-50" />
                <div className="relative bg-gradient-to-br from-[#4F46E5] to-[#4338CA] p-2 rounded-xl">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#10B981] bg-clip-text text-transparent font-bold text-xl">
                {brandName}
              </span>
            </div>

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
                        : "text-foreground/80 hover:bg-accent"
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {rightSlot}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground/85 hover:text-foreground hover:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen((open: boolean) => !open)}
                className="md:hidden p-2 rounded-lg hover:bg-accent"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-foreground/85" />
                ) : (
                  <Menu className="h-6 w-6 text-foreground/85" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isMobileMenuOpen && (
              <motion.div
                key="mobile-nav"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-4 border-t border-border">
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
                              : "text-foreground/80 hover:bg-accent"
                          }
                        `}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/85 hover:bg-accent"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
