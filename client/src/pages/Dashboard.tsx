import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  FileText,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { TechBackground } from "../components/TechBackground";
import { TopToast } from "../components/common/TopToast";
import { motion } from "motion/react";
import api from "../services/api";
import { getErrorMessage } from "../utils/error";

type Project = {
  _id: string;
  title: string;
  description?: string;
  createdAt?: string;
};

type Task = {
  _id: string;
  title: string;
  projectId?: string;
  status?: string;
  dueDate?: string;
  updatedAt?: string;
};

type Retro = {
  _id: string;
  projectId?: string;
  content: string;
  createdAt?: string;
};

type Schedule = {
  _id: string;
  title: string;
  date?: string;
  category?: string;
};

type DashboardProject = {
  id: string;
  name: string;
  progress: number;
  status: "active" | "review";
  dueDate: string;
  tasks: { total: number; completed: number };
};

type StatCard = {
  label: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  change: string;
};

type Activity = {
  type: "task" | "project" | "retrospective";
  title: string;
  project?: string;
  time: string;
};

function buildDashboardProjects(
  projects: Project[],
  tasks: Task[]
): DashboardProject[] {
  const tasksByProject = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.projectId ?? "unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  return projects.map(project => {
    const projectTasks = tasksByProject[project._id] ?? [];
    const total = projectTasks.length;
    const completed = projectTasks.filter(
      t => t.status === "done" || t.status === "완료"
    ).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const dueDates = projectTasks
      .map(t => (t.dueDate ? new Date(t.dueDate) : null))
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    const nextDue = dueDates[0];

    return {
      id: project._id,
      name: project.title,
      progress,
      status: progress >= 90 ? "review" : "active",
      dueDate: nextDue ? nextDue.toISOString().slice(0, 10) : "미정",
      tasks: { total, completed },
    };
  });
}

function buildStats(
  projects: DashboardProject[],
  tasks: Task[],
  upcomingTaskDeadlines: number,
  upcomingScheduleDeadlines: number
): StatCard[] {
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    t => t.status === "done" || t.status === "완료"
  ).length;

  const upcomingDeadlines = upcomingTaskDeadlines + upcomingScheduleDeadlines;

  const productivity =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return [
    {
      label: "진행 중인 프로젝트",
      value: String(totalProjects),
      icon: FolderKanban,
      color: "from-[#4F46E5] to-[#7C3AED]",
      change: totalProjects ? "현재 활성" : "프로젝트 없음",
    },
    {
      label: "완료된 태스크",
      value: String(completedTasks),
      icon: CheckCircle2,
      color: "from-[#10B981] to-[#059669]",
      change: totalTasks ? `전체 ${totalTasks}개 중` : "태스크 없음",
    },
    {
      label: "다가오는 마감일",
      value: String(upcomingDeadlines),
      icon: Clock,
      color: "from-[#F59E0B] to-[#EF4444]",
      change: `태스크 ${upcomingTaskDeadlines}개 · 일정 ${upcomingScheduleDeadlines}개 (7일 이내)`,
    },
    {
      label: "전체 생산성",
      value: `${productivity}%`,
      icon: TrendingUp,
      color: "from-[#06B6D4] to-[#3B82F6]",
      change: "완료 비율 기준",
    },
  ];
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}일 전`;
}

function getUpcomingCounts(tasks: Task[], schedules: Schedule[]) {
  const now = new Date();
  const in7days = new Date(now);
  in7days.setDate(now.getDate() + 7);

  const upcomingTaskDeadlines = tasks.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d >= now && d <= in7days;
  }).length;

  const upcomingScheduleDeadlines = schedules.filter(s => {
    if (!s.date) return false;
    const d = new Date(s.date);
    return d >= now && d <= in7days;
  }).length;

  return { upcomingTaskDeadlines, upcomingScheduleDeadlines };
}

function buildActivities(
  projects: Project[],
  retros: Retro[]
): Activity[] {
  const projectNameMap = new Map<string, string>();
  projects.forEach(p => projectNameMap.set(p._id, p.title));

  const projectActivities: Activity[] = projects
    .filter(p => p.createdAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt as string).getTime() -
        new Date(a.createdAt as string).getTime()
    )
    .slice(0, 3)
    .map(p => ({
      type: "project",
      title: "새 프로젝트 생성",
      project: p.title,
      time: formatRelativeTime(p.createdAt as string),
    }));

  const retroActivities: Activity[] = retros
    .filter(r => r.createdAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt as string).getTime() -
        new Date(a.createdAt as string).getTime()
    )
    .slice(0, 3)
    .map(r => ({
      type: "retrospective",
      title: r.content.length > 28 ? `${r.content.slice(0, 28)}…` : r.content,
      project: r.projectId
        ? projectNameMap.get(r.projectId) ?? "알 수 없는 프로젝트"
        : "프로젝트 미지정",
      time: formatRelativeTime(r.createdAt as string),
    }));

  const merged = [...projectActivities, ...retroActivities].slice(0, 4);

  if (merged.length === 0) {
    return [
      {
        type: "project",
        title: "아직 기록된 활동이 없습니다",
        time: "오늘",
      },
    ];
  }

  return merged;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [rawProjects, setRawProjects] = useState<Project[]>([]);
  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [rawSchedules, setRawSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [openQuickTask, setOpenQuickTask] = useState(false);
  const [openQuickSchedule, setOpenQuickSchedule] = useState(false);
  const [openUpcoming, setOpenUpcoming] = useState(false);
  const [openCompletedTasks, setOpenCompletedTasks] = useState(false);
  const [completedProjectId, setCompletedProjectId] = useState("all");
  const [completedGroupByProject, setCompletedGroupByProject] = useState(true);
  const [completedQueryInput, setCompletedQueryInput] = useState("");
  const [completedQuery, setCompletedQuery] = useState("");
  const [openOverdueTasks, setOpenOverdueTasks] = useState(false);
  const [highlightProjects, setHighlightProjects] = useState(false);
  const projectsRef = React.useRef<HTMLDivElement | null>(null);
  const [overdueSelectedIds, setOverdueSelectedIds] = useState<string[]>([]);
  const [overdueStatus, setOverdueStatus] = useState<"todo" | "doing" | "done">(
    "doing"
  );
  const [overdueQuery, setOverdueQuery] = useState("");
  const [overdueFilter, setOverdueFilter] = useState<
    "all" | "todo" | "doing"
  >("all");
  const [overdueProjectId, setOverdueProjectId] = useState("all");

  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [quickTaskProjectId, setQuickTaskProjectId] = useState("");
  const [quickTaskStatus, setQuickTaskStatus] = useState<
    "todo" | "doing" | "done"
  >("todo");
  const [quickTaskDueDate, setQuickTaskDueDate] = useState("");
  const [quickTaskMemo, setQuickTaskMemo] = useState("");

  const [quickScheduleTitle, setQuickScheduleTitle] = useState("");
  const [quickScheduleMode, setQuickScheduleMode] = useState<"single" | "range">(
    "single"
  );
  const [quickScheduleDate, setQuickScheduleDate] = useState("");
  const [quickScheduleStartDate, setQuickScheduleStartDate] = useState("");
  const [quickScheduleEndDate, setQuickScheduleEndDate] = useState("");
  const [quickScheduleCategory, setQuickScheduleCategory] = useState("회의");
  const [quickScheduleMemo, setQuickScheduleMemo] = useState("");


  const showToast = (message: string) => {
    setToast({ message });
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 2400);
  };

  const scrollToProjects = () => {
    if (!projectsRef.current) return;
    projectsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlightProjects(true);
    window.setTimeout(() => setHighlightProjects(false), 1200);
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [projectsRes, tasksRes, retrosRes, schedulesRes] =
        await Promise.all([
          api.get<Project[]>("/api/projects"),
          api.get<Task[]>("/api/tasks"),
          api.get<Retro[]>("/api/retros"),
          api.get<Schedule[]>("/api/schedules"),
        ]);

      const projectsData = projectsRes.data ?? [];
      const tasksData = tasksRes.data ?? [];
      const retrosData = retrosRes.data ?? [];
      const schedulesData = schedulesRes.data ?? [];

      const dashboardProjects = buildDashboardProjects(
        projectsData,
        tasksData
      );
      const { upcomingTaskDeadlines, upcomingScheduleDeadlines } =
        getUpcomingCounts(tasksData, schedulesData);
      const dashboardStats = buildStats(
        dashboardProjects,
        tasksData,
        upcomingTaskDeadlines,
        upcomingScheduleDeadlines
      );
      const activities = buildActivities(projectsData, retrosData);

      setProjects(dashboardProjects);
      setStats(dashboardStats);
      setRecentActivities(activities);
      setRawProjects(projectsData);
      setRawTasks(tasksData);
      setRawSchedules(schedulesData);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("대시보드 데이터를 불러오려면 로그인이 필요합니다.");
      } else {
        setError(
          getErrorMessage(err) || "대시보드 데이터를 불러오지 못했습니다."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (cancelled) return;
    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [loadDashboard]);

  const createQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskProjectId) {
      showToast("프로젝트를 선택해주세요.");
      return;
    }
    if (!quickTaskTitle.trim()) {
      showToast("태스크 제목을 입력해주세요.");
      return;
    }
    try {
      const isoDue = quickTaskDueDate
        ? new Date(quickTaskDueDate).toISOString()
        : undefined;
      await api.post("/api/tasks", {
        title: quickTaskTitle,
        projectId: quickTaskProjectId,
        status: quickTaskStatus,
        dueDate: isoDue,
        memo: quickTaskMemo || undefined,
      });
      setQuickTaskTitle("");
      setQuickTaskProjectId("");
      setQuickTaskStatus("todo");
      setQuickTaskDueDate("");
      setQuickTaskMemo("");
      setOpenQuickTask(false);
      showToast("태스크가 생성되었습니다.");
      void loadDashboard();
    } catch (err: unknown) {
      showToast(getErrorMessage(err) || "태스크 생성 실패");
    }
  };

  const createQuickSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScheduleTitle.trim()) {
      showToast("일정 제목을 입력해주세요.");
      return;
    }
    if (quickScheduleMode === "single" && !quickScheduleDate) {
      showToast("일정을 선택해주세요.");
      return;
    }
    if (quickScheduleMode === "range") {
      if (!quickScheduleStartDate || !quickScheduleEndDate) {
        showToast("시작일과 마감일을 입력해주세요.");
        return;
      }
      if (
        new Date(quickScheduleStartDate).getTime() >
        new Date(quickScheduleEndDate).getTime()
      ) {
        showToast("마감일은 시작일 이후여야 합니다.");
        return;
      }
    }
    try {
      const isoDate =
        quickScheduleMode === "single"
          ? new Date(quickScheduleDate).toISOString()
          : new Date(quickScheduleStartDate).toISOString();
      await api.post("/api/schedules", {
        title: quickScheduleTitle,
        date: isoDate,
        startDate:
          quickScheduleMode === "range"
            ? new Date(quickScheduleStartDate).toISOString()
            : undefined,
        endDate:
          quickScheduleMode === "range"
            ? new Date(quickScheduleEndDate).toISOString()
            : undefined,
        category: quickScheduleCategory,
        memo: quickScheduleMemo || undefined,
      });
      setQuickScheduleTitle("");
      setQuickScheduleMode("single");
      setQuickScheduleDate("");
      setQuickScheduleStartDate("");
      setQuickScheduleEndDate("");
      setQuickScheduleCategory("회의");
      setQuickScheduleMemo("");
      setOpenQuickSchedule(false);
      showToast("일정이 추가되었습니다.");
      void loadDashboard();
    } catch (err: unknown) {
      showToast(getErrorMessage(err) || "일정 생성 실패");
    }
  };

  const bulkUpdateOverdue = async () => {
    if (overdueSelectedIds.length === 0) {
      showToast("선택된 태스크가 없습니다.");
      return;
    }
    try {
      await Promise.all(
        overdueSelectedIds.map(id =>
          api.put(`/api/tasks/${id}`, { status: overdueStatus })
        )
      );
      showToast("선택된 태스크 상태가 변경되었습니다.");
      setOverdueSelectedIds([]);
      void loadDashboard();
    } catch (err: unknown) {
      showToast(getErrorMessage(err) || "일괄 변경 실패");
    }
  };

  const completedTasks = useMemo(
    () => rawTasks.filter(t => t.status === "done"),
    [rawTasks]
  );

  const completedTasksFiltered = useMemo(
    () =>
      completedTasks.filter(
        t =>
          (completedProjectId === "all" || t.projectId === completedProjectId) &&
          (!completedQuery ||
            t.title.toLowerCase().includes(completedQuery.toLowerCase()))
      ),
    [completedProjectId, completedQuery, completedTasks]
  );

  const completedTasksByProject = useMemo<Map<string, Task[]>>(
    () =>
      completedTasksFiltered.reduce<Map<string, Task[]>>((acc, t) => {
        const key = t.projectId ?? "unassigned";
        if (!acc.has(key)) acc.set(key, []);
        acc.get(key)!.push(t);
        return acc;
      }, new Map<string, Task[]>()),
    [completedTasksFiltered]
  );

  const projectNameById = useMemo(
    () =>
      rawProjects.reduce<Record<string, string>>((acc, p) => {
        acc[p._id] = p.title;
        return acc;
      }, {}),
    [rawProjects]
  );
  const unifiedCardShadow =
    "shadow-[0_16px_36px_rgba(15,23,42,0.14)] dark:shadow-[0_18px_40px_rgba(2,6,23,0.34)]";
  const baseGlassCard = `group relative overflow-hidden border border-white/78 dark:border-slate-700/55 bg-white/62 dark:bg-slate-800/44 backdrop-blur-2xl ring-1 ring-white/68 dark:ring-white/8 transition-all duration-320 hover:-translate-y-1.5 hover:scale-[1.048] hover:shadow-[0_28px_64px_rgba(59,130,246,0.22),0_18px_38px_rgba(15,23,42,0.15)] dark:hover:shadow-[0_28px_64px_rgba(2,6,23,0.52)] ${unifiedCardShadow}`;
  const projectCardGlass = `group relative overflow-hidden border border-white/78 dark:border-slate-700/55 bg-white/62 dark:bg-slate-800/44 backdrop-blur-2xl ring-1 ring-white/68 dark:ring-white/8 transition-all duration-280 hover:-translate-y-1 hover:scale-[1.018] hover:shadow-[0_20px_42px_rgba(59,130,246,0.16),0_12px_26px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_20px_42px_rgba(2,6,23,0.44)] ${unifiedCardShadow}`;
  const statGlassCard = `group relative overflow-hidden border border-white/86 dark:border-slate-700/60 bg-white/72 dark:bg-slate-800/50 backdrop-blur-3xl ring-1 ring-white/76 dark:ring-white/10 transition-all duration-320 hover:-translate-y-2 hover:scale-[1.052] hover:shadow-[0_32px_70px_rgba(59,130,246,0.24),0_18px_38px_rgba(15,23,42,0.14)] dark:hover:shadow-[0_32px_70px_rgba(2,6,23,0.54)] ${unifiedCardShadow}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Tech Background */}
      <TechBackground />

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <LayoutDashboard className="h-8 w-8 text-[#4F46E5] dark:text-[#818CF8]" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              대시보드
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            프로젝트 현황을 한눈에 확인하세요
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const isProjects = stat.label === "진행 중인 프로젝트";
            const isCompleted = stat.label === "완료된 태스크";
            const isUpcoming = stat.label === "다가오는 마감일";
            return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -8 }}
            >
              <Card
                className={`${statGlassCard} ${
                  isProjects || isCompleted || isUpcoming
                    ? "cursor-pointer"
                    : ""
                }`}
                onClick={() => {
                  if (isProjects) scrollToProjects();
                  if (isCompleted) setOpenCompletedTasks(true);
                  if (isUpcoming) setOpenUpcoming(true);
                }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"
                  style={{
                    background: `linear-gradient(to bottom right, ${stat.color})`,
                  }}
                />
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/46 via-white/8 to-transparent dark:from-white/10 dark:via-white/0 dark:to-transparent" />
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/70 dark:bg-white/20" />
                <div className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full bg-white/45 blur-3xl opacity-35 transition-all duration-300 group-hover:opacity-65 group-hover:scale-110 dark:bg-white/8 dark:opacity-25 dark:group-hover:opacity-45" />
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2 dark:text-white">
                    {stat.value}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {stat.change}
                  </p>
                </div>
              </Card>
            </motion.div>
          )})}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects Overview */}
          <div className="lg:col-span-2 space-y-6" ref={projectsRef}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                진행 중인 프로젝트
              </h2>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/projects")}
                  className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />새 프로젝트
                </Button>
              </motion.div>
            </div>

            <div className="space-y-4">
              {loading && projects.length === 0 && (
                <Card className={`p-6 ${baseGlassCard}`}>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    프로젝트 데이터를 불러오는 중입니다...
                  </p>
                </Card>
              )}

              {!loading && projects.length === 0 && !error && (
                <Card className={`p-6 ${baseGlassCard}`}>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    아직 등록된 프로젝트가 없습니다. 상단의 "새 프로젝트" 버튼을
                    눌러 첫 프로젝트를 만들어 보세요.
                  </p>
                </Card>
              )}

              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.012, x: 3 }}
                >
                  <Card
                    className={`p-6 transition-all duration-280 ${projectCardGlass} ${
                      highlightProjects ? "ring-2 ring-indigo-400/60" : ""
                    }`}
                  >
                    <div className="pointer-events-none absolute -top-14 -right-10 h-36 w-36 rounded-full bg-white/40 blur-3xl opacity-30 transition-all duration-300 group-hover:opacity-60 group-hover:scale-110 dark:bg-white/8 dark:opacity-20 dark:group-hover:opacity-40" />
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            {project.tasks.completed}/{project.tasks.total} 완료
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {project.dueDate}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          project.status === "active"
                            ? "bg-[#10B981]/10 text-[#10B981] dark:bg-[#10B981]/20 dark:text-[#6EE7B7]"
                            : "bg-[#F59E0B]/10 text-[#F59E0B] dark:bg-[#F59E0B]/20 dark:text-[#FCD34D]"
                        }`}
                      >
                        {project.status === "active" ? "진행중" : "검토중"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          진행률
                        </span>
                        <span className="font-semibold text-[#4F46E5] dark:text-[#818CF8]">
                          {project.progress}%
                        </span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                  <div className="flex gap-2 mt-4">
                  <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/tasks?projectId=${project.id}`)}
                        className="flex-1 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-gray-200 dark:border-slate-600"
                      >
                        태스크 보기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/retrospective?projectId=${project.id}`)
                        }
                        className="flex-1 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-gray-200 dark:border-slate-600"
                      >
                        회고 보기
                      </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className={`p-6 ${baseGlassCard}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  빠른 작업
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setQuickScheduleMode("single");
                      setQuickScheduleDate("");
                      setQuickScheduleStartDate("");
                      setQuickScheduleEndDate("");
                      setOpenQuickSchedule(true);
                    }}
                    variant="outline"
                    className="w-full justify-start hover:bg-[#4F46E5]/5 hover:border-[#4F46E5]/20"
                  >
                    <Calendar className="h-4 w-4 mr-2 text-[#4F46E5]" />
                    일정 추가
                  </Button>
                  <Button
                    onClick={() => setOpenQuickTask(true)}
                    variant="outline"
                    className="w-full justify-start hover:bg-[#10B981]/5 hover:border-[#10B981]/20"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-[#10B981]" />
                    태스크 생성
                  </Button>
                  <Button
                    onClick={() => navigate("/retrospective")}
                    variant="outline"
                    className="w-full justify-start hover:bg-[#F59E0B]/5 hover:border-[#F59E0B]/20"
                  >
                    <FileText className="h-4 w-4 mr-2 text-[#F59E0B]" />
                    회고 보기
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className={`p-6 ${baseGlassCard}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  최근 활동
                </h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div
                        className={`p-2 rounded-lg h-fit ${
                          activity.type === "task"
                            ? "bg-[#10B981]/10 dark:bg-[#10B981]/20"
                            : activity.type === "project"
                            ? "bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20"
                            : "bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20"
                        }`}
                      >
                        {activity.type === "task" && (
                          <CheckCircle2 className="h-4 w-4 text-[#10B981] dark:text-[#6EE7B7]" />
                        )}
                        {activity.type === "project" && (
                          <FolderKanban className="h-4 w-4 text-[#4F46E5] dark:text-[#818CF8]" />
                        )}
                        {activity.type === "retrospective" && (
                          <FileText className="h-4 w-4 text-[#F59E0B] dark:text-[#FCD34D]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {activity.title}
                        </p>
                        {activity.project && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {activity.project}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}

                  {!loading && recentActivities.length === 0 && !error && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      아직 기록된 활동이 없습니다.
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Deadline Alert */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.04 }}
            >
              <Card className={`p-6 bg-gradient-to-br from-red-50/80 to-orange-50/80 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800 backdrop-blur-2xl ${unifiedCardShadow}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      다가오는 마감일
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      7일 이내에 마감되는 태스크와 일정 수를 통계 카드에서
                      확인할 수 있습니다.
                    </p>
                    <Button
                      onClick={() => setOpenUpcoming(true)}
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      일정 확인
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Overdue Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className={`p-6 bg-white/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/70 backdrop-blur-2xl ${unifiedCardShadow}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      마감 초과 태스크
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                      {rawTasks.filter(t => {
                        if (!t.dueDate) return false;
                        const d = new Date(t.dueDate);
                        return d < new Date() && t.status !== "done";
                      }).length}
                    </div>
                  </div>
                  <Button onClick={() => setOpenOverdueTasks(true)}>
                    확인
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {toast && <TopToast message={toast.message} />}

      {/* Upcoming Deadlines Dialog */}
      <Dialog open={openUpcoming} onOpenChange={setOpenUpcoming}>
        <DialogContent
          className="sm:max-w-3xl"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              setOpenUpcoming(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>다가오는 마감일</DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-white/70 dark:bg-slate-900/60">
                <div className="text-xs text-slate-500">태스크</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {
                    getUpcomingCounts(rawTasks, rawSchedules)
                      .upcomingTaskDeadlines
                  }
                </div>
              </Card>
              <Card className="p-4 bg-white/70 dark:bg-slate-900/60">
                <div className="text-xs text-slate-500">일정</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {
                    getUpcomingCounts(rawTasks, rawSchedules)
                      .upcomingScheduleDeadlines
                  }
                </div>
              </Card>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                7일 이내 태스크
              </div>
              <div className="space-y-2">
                {rawTasks
                  .filter(t => {
                    if (!t.dueDate) return false;
                    const d = new Date(t.dueDate);
                    const now = new Date();
                    const in7 = new Date();
                    in7.setDate(now.getDate() + 7);
                    return d >= now && d <= in7;
                  })
                  .map(t => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between rounded-lg border border-slate-200/70 dark:border-slate-700/70 p-3"
                    >
                      <div>
                        <div className="font-medium text-slate-800 dark:text-white">
                          {t.title}
                        </div>
                        {t.dueDate && (
                          <div className="text-xs text-slate-500">
                            {new Date(t.dueDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/tasks?projectId=${t.projectId ?? ""}&highlight=${t._id}`
                      )
                    }
                  >
                    보기
                  </Button>
                    </div>
                  ))}
                {rawTasks.filter(t => {
                  if (!t.dueDate) return false;
                  const d = new Date(t.dueDate);
                  const now = new Date();
                  const in7 = new Date();
                  in7.setDate(now.getDate() + 7);
                  return d >= now && d <= in7;
                }).length === 0 && (
                  <div className="text-sm text-slate-500">
                    해당 태스크가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                7일 이내 일정
              </div>
              <div className="space-y-2">
                {rawSchedules
                  .filter(s => {
                    if (!s.date) return false;
                    const d = new Date(s.date);
                    const now = new Date();
                    const in7 = new Date();
                    in7.setDate(now.getDate() + 7);
                    return d >= now && d <= in7;
                  })
                  .map(s => (
                    <div
                      key={s._id}
                      className="flex items-center justify-between rounded-lg border border-slate-200/70 dark:border-slate-700/70 p-3"
                    >
                      <div>
                        <div className="font-medium text-slate-800 dark:text-white">
                          {s.title}
                        </div>
                        {s.date && (
                          <div className="text-xs text-slate-500">
                            {new Date(s.date).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Button size="sm" onClick={() => navigate("/schedule")}>
                        보기
                      </Button>
                    </div>
                  ))}
                {rawSchedules.filter(s => {
                  if (!s.date) return false;
                  const d = new Date(s.date);
                  const now = new Date();
                  const in7 = new Date();
                  in7.setDate(now.getDate() + 7);
                  return d >= now && d <= in7;
                }).length === 0 && (
                  <div className="text-sm text-slate-500">
                    해당 일정이 없습니다.
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-500">
              단축키: ⌘/Ctrl+Enter 닫기
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Completed Tasks Dialog */}
      <Dialog open={openCompletedTasks} onOpenChange={setOpenCompletedTasks}>
        <DialogContent
          className="sm:max-w-2xl max-h-[80vh] overflow-hidden"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              setOpenCompletedTasks(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>완료된 태스크</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 h-full min-h-0">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-slate-500">
                완료된 태스크 {completedTasksFiltered.length}개 / 전체 {completedTasks.length}개
              </div>
              <button
                className="text-xs underline text-slate-500"
                onClick={() => setCompletedGroupByProject(v => !v)}
              >
                {completedGroupByProject ? "리스트 보기" : "프로젝트별 보기"}
              </button>
            </div>
            <Select value={completedProjectId} onValueChange={setCompletedProjectId}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="all">전체 프로젝트</SelectItem>
                {rawProjects.map(p => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="제목으로 검색"
              value={completedQueryInput}
              onChange={e => setCompletedQueryInput(e.target.value)}
              className="h-9"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setCompletedQuery(completedQueryInput.trim())}
              >
                검색
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCompletedQueryInput("");
                  setCompletedQuery("");
                }}
              >
                초기화
              </Button>
            </div>
            <div className="space-y-2 overflow-y-auto pr-1 max-h-[58vh]">
              {completedGroupByProject
                ? Array.from(completedTasksByProject.entries()).map(([pid, list]) => (
                    <div key={pid} className="space-y-2">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {pid === "unassigned"
                          ? "프로젝트 미지정"
                          : projectNameById[pid] ?? "알 수 없는 프로젝트"}
                      </div>
                      {list.map(t => (
                        <div
                          key={t._id}
                          className="flex items-center justify-between rounded-lg border border-slate-200/70 dark:border-slate-700/70 p-3"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 dark:text-white truncate">
                              {t.title}
                            </div>
                            <div className="text-xs text-slate-500">
                              프로젝트:{" "}
                              {t.projectId
                                ? projectNameById[t.projectId] ?? "알 수 없는 프로젝트"
                                : "프로젝트 미지정"}
                            </div>
                            {t.updatedAt && (
                              <div className="text-xs text-slate-500">
                                완료: {new Date(t.updatedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/tasks?projectId=${t.projectId ?? ""}&highlight=${t._id}`
                              )
                            }
                          >
                            보기
                          </Button>
                        </div>
                      ))}
                    </div>
                  ))
                : completedTasksFiltered.map(t => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between rounded-lg border border-slate-200/70 dark:border-slate-700/70 p-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 dark:text-white truncate">
                          {t.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          프로젝트:{" "}
                          {t.projectId
                            ? projectNameById[t.projectId] ?? "알 수 없는 프로젝트"
                            : "프로젝트 미지정"}
                        </div>
                        {t.updatedAt && (
                          <div className="text-xs text-slate-500">
                            완료: {new Date(t.updatedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/tasks?projectId=${t.projectId ?? ""}&highlight=${t._id}`
                          )
                        }
                      >
                        보기
                      </Button>
                    </div>
                  ))}
              {completedTasksFiltered.length === 0 && (
                <div className="text-sm text-slate-500">
                  완료된 태스크가 없습니다.
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500">
              단축키: ⌘/Ctrl+Enter 닫기
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overdue Tasks Dialog */}
      <Dialog open={openOverdueTasks} onOpenChange={setOpenOverdueTasks}>
        <DialogContent
          className="sm:max-w-2xl"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void bulkUpdateOverdue();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>마감 초과 태스크</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                선택한 태스크 상태 변경
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={overdueStatus}
                  onValueChange={value =>
                    setOverdueStatus(value as "todo" | "doing" | "done")
                  }
                >
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">할 일</SelectItem>
                    <SelectItem value="doing">진행 중</SelectItem>
                    <SelectItem value="done">완료</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={bulkUpdateOverdue}>적용</Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="태스크 검색"
                value={overdueQuery}
                onChange={e => setOverdueQuery(e.target.value)}
              />
              <Select
                value={overdueProjectId}
                onValueChange={setOverdueProjectId}
              >
                <SelectTrigger className="h-9 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 프로젝트</SelectItem>
                  {rawProjects.map(p => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={overdueFilter}
                onValueChange={value =>
                  setOverdueFilter(value as "all" | "todo" | "doing")
                }
              >
                <SelectTrigger className="h-9 w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="todo">할 일</SelectItem>
                  <SelectItem value="doing">진행 중</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <div>
                선택됨 {overdueSelectedIds.length}개
              </div>
              <button
                className="underline"
                onClick={() => {
                  const overdueIds = rawTasks
                    .filter(t => {
                      if (!t.dueDate) return false;
                      const d = new Date(t.dueDate);
                      const projectOk =
                        overdueProjectId === "all" ||
                        t.projectId === overdueProjectId;
                      const statusOk =
                        overdueFilter === "all"
                          ? true
                          : t.status === overdueFilter;
                      const textOk =
                        !overdueQuery ||
                        t.title
                          .toLowerCase()
                          .includes(overdueQuery.toLowerCase());
                      return (
                        d < new Date() &&
                        t.status !== "done" &&
                        projectOk &&
                        statusOk &&
                        textOk
                      );
                    })
                    .map(t => t._id);
                  setOverdueSelectedIds(
                    overdueSelectedIds.length === overdueIds.length
                      ? []
                      : overdueIds
                  );
                }}
              >
                전체 선택/해제
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-4">
              {Array.from(
                rawTasks
                  .filter(t => {
                    if (!t.dueDate) return false;
                    const d = new Date(t.dueDate);
                    const projectOk =
                      overdueProjectId === "all" ||
                      t.projectId === overdueProjectId;
                    const statusOk =
                      overdueFilter === "all"
                        ? true
                        : t.status === overdueFilter;
                    const textOk =
                      !overdueQuery ||
                      t.title
                        .toLowerCase()
                        .includes(overdueQuery.toLowerCase());
                    return (
                      d < new Date() &&
                      t.status !== "done" &&
                      projectOk &&
                      statusOk &&
                      textOk
                    );
                  })
                  .reduce((acc, t) => {
                    const key = t.projectId ?? "unassigned";
                    if (!acc.has(key)) acc.set(key, []);
                    acc.get(key)!.push(t);
                    return acc;
                  }, new Map<string, typeof rawTasks>())
                  .entries()
              ).map(([pid, list]) => (
                <div key={pid} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {pid === "unassigned"
                        ? "프로젝트 미지정"
                        : rawProjects.find(p => p._id === pid)?.title ||
                          "알 수 없는 프로젝트"}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {
                        list.filter(t => overdueSelectedIds.includes(t._id))
                          .length
                      }
                      /{list.length}
                    </span>
                    <button
                      className="text-xs underline text-slate-500"
                      onClick={() => {
                        const ids = list.map(t => t._id);
                        const allSelected = ids.every(id =>
                          overdueSelectedIds.includes(id)
                        );
                        setOverdueSelectedIds(s =>
                          allSelected
                            ? s.filter(id => !ids.includes(id))
                            : Array.from(new Set([...s, ...ids]))
                        );
                      }}
                    >
                      프로젝트 전체 선택/해제
                    </button>
                  </div>
                  {list.map((t, idx) => (
                    <motion.div
                      key={t._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center justify-between rounded-lg border border-red-200/70 dark:border-red-800/50 p-3"
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={overdueSelectedIds.includes(t._id)}
                          onChange={e => {
                            setOverdueSelectedIds(s =>
                              e.target.checked
                                ? [...s, t._id]
                                : s.filter(id => id !== t._id)
                            );
                          }}
                        />
                        <div>
                          <div className="font-medium text-slate-800 dark:text-white">
                            {t.title}
                          </div>
                          {t.dueDate && (
                            <div className="text-xs text-red-500">
                              {new Date(t.dueDate).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </label>
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/tasks?projectId=${t.projectId ?? ""}&highlight=${t._id}`
                          )
                        }
                      >
                        보기
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ))}
              {rawTasks.filter(t => {
                if (!t.dueDate) return false;
                const d = new Date(t.dueDate);
                const projectOk =
                  overdueProjectId === "all" ||
                  t.projectId === overdueProjectId;
                const statusOk =
                  overdueFilter === "all"
                    ? true
                    : t.status === overdueFilter;
                const textOk =
                  !overdueQuery ||
                  t.title.toLowerCase().includes(overdueQuery.toLowerCase());
                return (
                  d < new Date() &&
                  t.status !== "done" &&
                  projectOk &&
                  statusOk &&
                  textOk
                );
              }).length === 0 && (
                <div className="text-sm text-slate-500">
                  마감 초과 태스크가 없습니다.
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500">
              단축키: ⌘/Ctrl+Enter 적용
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Task Dialog */}
      <Dialog open={openQuickTask} onOpenChange={setOpenQuickTask}>
        <DialogContent
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void createQuickTask(e as any);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>빠른 태스크 생성</DialogTitle>
          </DialogHeader>
          <form onSubmit={createQuickTask} className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">프로젝트</div>
              <Select
                value={quickTaskProjectId}
                onValueChange={setQuickTaskProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="프로젝트 선택" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {rawProjects.map(p => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="태스크 제목"
              value={quickTaskTitle}
              onChange={e => setQuickTaskTitle(e.target.value)}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
            <div>
              <div className="text-xs text-slate-500 mb-1">마감일</div>
              <Input
                type="date"
                value={quickTaskDueDate}
                onChange={e => setQuickTaskDueDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">메모</div>
              <Textarea
                rows={3}
                placeholder="메모를 입력하세요"
                value={quickTaskMemo}
                onChange={e => setQuickTaskMemo(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <Select
              value={quickTaskStatus}
              onValueChange={(value: "todo" | "doing" | "done") =>
                setQuickTaskStatus(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">할 일</SelectItem>
                <SelectItem value="doing">진행 중</SelectItem>
                <SelectItem value="done">완료</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">생성</Button>
            <div className="text-xs text-slate-500">
              단축키: ⌘/Ctrl+Enter 생성
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Schedule Dialog */}
      <Dialog open={openQuickSchedule} onOpenChange={setOpenQuickSchedule}>
        <DialogContent
          className="w-[min(94vw,720px)] max-h-[88vh] p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-700/70"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void createQuickSchedule(e as any);
            }
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-slate-200/70 dark:border-slate-700/70">
            <DialogTitle>빠른 일정 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={createQuickSchedule} className="space-y-0">
            <div className="max-h-[calc(88vh-144px)] overflow-y-auto px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-1 bg-slate-50/80 dark:bg-slate-900/40">
                <button
                  type="button"
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    quickScheduleMode === "single"
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                      : "text-slate-500 dark:text-slate-300"
                  }`}
                  onClick={() => setQuickScheduleMode("single")}
                >
                  단일 일정
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    quickScheduleMode === "range"
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                      : "text-slate-500 dark:text-slate-300"
                  }`}
                  onClick={() => setQuickScheduleMode("range")}
                >
                  기간 일정
                </button>
              </div>

              <Input
                placeholder="일정 제목"
                value={quickScheduleTitle}
                onChange={e => setQuickScheduleTitle(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />

              {quickScheduleMode === "single" ? (
                <div>
                  <div className="text-xs text-slate-500 mb-1">날짜</div>
                  <Input
                    type="date"
                    value={quickScheduleDate}
                    onChange={e => setQuickScheduleDate(e.target.value)}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">시작일</div>
                    <Input
                      type="date"
                      value={quickScheduleStartDate}
                      onChange={e => setQuickScheduleStartDate(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">마감일</div>
                    <Input
                      type="date"
                      value={quickScheduleEndDate}
                      onChange={e => setQuickScheduleEndDate(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                  </div>
                </div>
              )}

              <Select
                value={quickScheduleCategory}
                onValueChange={setQuickScheduleCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="회의">회의</SelectItem>
                  <SelectItem value="개발">개발</SelectItem>
                  <SelectItem value="개인">개인</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <div className="text-xs text-slate-500 mb-1">메모</div>
                <Textarea
                  rows={4}
                  placeholder="메모를 입력하세요"
                  value={quickScheduleMemo}
                  onChange={e => setQuickScheduleMemo(e.target.value)}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
              </div>
            </div>
            <div className="px-6 py-3 border-t border-slate-200/70 dark:border-slate-700/70 bg-slate-50/60 dark:bg-slate-900/30">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">단축키: ⌘/Ctrl+Enter 추가</div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenQuickSchedule(false)}
                  >
                    취소
                  </Button>
                  <Button type="submit">추가</Button>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
