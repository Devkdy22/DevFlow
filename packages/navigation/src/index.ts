import type { LucideIcon } from "lucide-react";
import { Calendar, FileText, FolderKanban, LayoutDashboard } from "lucide-react";
import { APP_NAVIGATION_BASE } from "./base";

export type NavigationItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

const ICON_BY_PATH: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/tasks": FolderKanban,
  "/schedule": Calendar,
  "/retrospective": FileText,
};

export const APP_NAVIGATION: NavigationItem[] = APP_NAVIGATION_BASE.map(item => ({
  ...item,
  icon: ICON_BY_PATH[item.path] ?? LayoutDashboard,
}));

export * from "./base";
