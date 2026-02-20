export type NavigationDefinition = {
  label: string;
  path: string;
};

export const APP_NAVIGATION_BASE: NavigationDefinition[] = [
  { label: "대시보드", path: "/dashboard" },
  { label: "태스크 보드", path: "/tasks" },
  { label: "일정 관리", path: "/schedule" },
  { label: "프로젝트 회고", path: "/retrospective" },
];
