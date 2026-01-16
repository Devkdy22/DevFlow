import React, { useEffect, useState } from "react";
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
import { TechBackground } from "../components/TechBackground";
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
  schedules: Schedule[]
): StatCard[] {
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    t => t.status === "done" || t.status === "완료"
  ).length;

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
      change: "7일 이내",
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

function buildActivities(projects: Project[], retros: Retro[]): Activity[] {
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
      title: "스프린트 회고 작성",
      project: r.projectId,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
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

        if (cancelled) return;

        const projectsData = projectsRes.data ?? [];
        const tasksData = tasksRes.data ?? [];
        const retrosData = retrosRes.data ?? [];
        const schedulesData = schedulesRes.data ?? [];

        const dashboardProjects = buildDashboardProjects(
          projectsData,
          tasksData
        );
        const dashboardStats = buildStats(
          dashboardProjects,
          tasksData,
          schedulesData
        );
        const activities = buildActivities(projectsData, retrosData);

        setProjects(dashboardProjects);
        setStats(dashboardStats);
        setRecentActivities(activities);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError("대시보드 데이터를 불러오려면 로그인이 필요합니다.");
        } else {
          setError(
            getErrorMessage(err) || "대시보드 데이터를 불러오지 못했습니다."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

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
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border-white/50 dark:border-slate-700/50">
                <div
                  className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"
                  style={{
                    background: `linear-gradient(to bottom right, ${stat.color})`,
                  }}
                />
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
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects Overview */}
          <div className="lg:col-span-2 space-y-6">
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
                <Card className="p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border-white/50 dark:border-slate-700/50">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    프로젝트 데이터를 불러오는 중입니다...
                  </p>
                </Card>
              )}

              {!loading && projects.length === 0 && !error && (
                <Card className="p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border-white/50 dark:border-slate-700/50">
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
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <Card className="p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border-white/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300">
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
                        onClick={() => navigate("/tasks")}
                        className="flex-1 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-gray-200 dark:border-slate-600"
                      >
                        태스크 보기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/retrospective")}
                        className="flex-1 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-gray-200 dark:border-slate-600"
                      >
                        회고 작성
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
              <Card className="p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border-white/50 dark:border-slate-700/50 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  빠른 작업
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/schedule")}
                    variant="outline"
                    className="w-full justify-start hover:bg-[#4F46E5]/5 hover:border-[#4F46E5]/20"
                  >
                    <Calendar className="h-4 w-4 mr-2 text-[#4F46E5]" />
                    일정 추가
                  </Button>
                  <Button
                    onClick={() => navigate("/tasks")}
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
                    회고 작성
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
              <Card className="p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border-white/50 dark:border-slate-700/50 shadow-xl">
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
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-6 bg-gradient-to-br from-red-50/80 to-orange-50/80 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800 backdrop-blur-2xl shadow-xl">
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
                      onClick={() => navigate("/schedule")}
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      일정 확인
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
