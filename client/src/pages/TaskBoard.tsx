import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import api from "../services/api";
import {
  Kanban,
  Plus,
  Clock,
  AlertCircle,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { TechBackground } from "../components/TechBackground";

type Task = {
  _id: string;
  title: string;
  projectId?: string;
  // status?: string;
  status?: "todo" | "doing" | "done";
  dueDate?: string;
};

type Project = {
  _id: string;
  title: string;
};

export function TaskBoard() {
  const [items, setItems] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  // const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState<"todo" | "doing" | "done">("todo");
  const [dueDate, setDueDate] = useState("");
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const load = async (projectId?: string) => {
    try {
      const tasksRes = await api.get<Task[]>("/api/tasks", {
        params: { projectId },
      });
      setItems(tasksRes.data || []);

      // 프로젝트 중복 제거 (_id 기준)
      // const uniqueProjects = [
      //   ...new Map(projectsRes.data.map(p => [p._id, p])).values(),
      // ];
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return navigate("/login");
      const msg = getErrorMessage(error);
      setErr(msg || "태스크 로드 실패");
    }
  };

  // useEffect(() => {
  //   load();
  // }, []);
  useEffect(() => {
    api.get<Project[]>("/api/projects").then(res => {
      setProjects(res.data);

      if (res.data.length > 0) {
        const firstProjectId = res.data[0]._id;
        setSelectedProjectId(firstProjectId);

        // 첫 번째 프로젝트 태스크만 불러오기
        load(firstProjectId);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    load(selectedProjectId);
  }, [selectedProjectId]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!selectedProjectId) {
      setErr("프로젝트를 선택해주세요.");
      return;
    }

    try {
      console.log("selectedProjectId:", selectedProjectId); // 실제 값 확인
      console.log("type:", typeof selectedProjectId);

      const isoDue = dueDate ? new Date(dueDate).toISOString() : undefined;

      const res = await api.post("/api/tasks", {
        title,
        projectId: selectedProjectId, // 🔥 현재 선택된 프로젝트
        status,
        dueDate: isoDue,
      });

      // 🔥 보드 즉시 갱신
      setItems(prev => [res.data, ...prev]);

      // 🔥 입력값 초기화
      setTitle("");
      setStatus("todo");
      setDueDate("");

      // 🔥 팝업 닫기
      setOpen(false);
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "태스크 생성 실패");
    }
  };

  const updateTaskStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await api.put(`/api/tasks/${id}`, { status: nextStatus });
      setItems(s => s.map(t => (t._id === id ? res.data : t)));
    } catch (error: unknown) {
      alert(getErrorMessage(error) || "업데이트 실패");
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("태스크를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      setItems(s => s.filter(t => t._id !== id));
    } catch (error: unknown) {
      alert(getErrorMessage(error) || "삭제 실패");
    }
  };

  const columns = useMemo(() => {
    return {
      todo: items.filter(t => t.status === "todo"),
      doing: items.filter(t => t.status === "doing"),
      done: items.filter(t => t.status === "done"),
    };
  }, [items]);

  const colMap = {
    todo: { title: "할 일", color: "from-slate-500 to-slate-700" },
    doing: { title: "진행 중", color: "from-indigo-500 to-purple-600" },
    done: { title: "완료", color: "from-emerald-500 to-emerald-700" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900">
      <TechBackground />

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <Kanban className="h-8 w-8 text-indigo-500" />
              <h1 className="text-2xl font-bold">태스크 보드</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                대시보드
              </Button>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />새 태스크
              </Button>
            </div>
          </div>

          {/* 🔥 프로젝트 선택 */}
          <div className="max-w-xs">
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="프로젝트 선택" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {projects.map(project => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["todo", "doing", "done"] as const).map(col => (
            <div key={col} className="flex flex-col">
              <div
                className={`mb-4 px-4 py-2 rounded-xl bg-gradient-to-r ${colMap[col].color} text-white`}
              >
                {colMap[col].title} ({columns[col].length})
              </div>

              <div className="space-y-3 flex-1">
                <AnimatePresence>
                  {columns[col].map(task => (
                    <motion.div key={task._id} layout>
                      <Card className="p-4 backdrop-blur bg-white/50 dark:bg-slate-800/50">
                        <div className="flex justify-between mb-2">
                          <h3>{task.title}</h3>
                          <button onClick={() => deleteTask(task._id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>

                        {task.dueDate && (
                          <div className="text-sm flex items-center gap-1 text-gray-500">
                            <Clock className="h-4 w-4" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}

                        <div className="flex justify-between mt-3">
                          {col !== "done" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTaskStatus(
                                  task._id,
                                  col === "todo" ? "doing" : "done"
                                )
                              }
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              다음 단계
                            </Button>
                          )}
                        </div>

                        {task.dueDate &&
                          new Date(task.dueDate) < new Date() &&
                          col !== "done" && (
                            <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              마감 초과
                            </div>
                          )}
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
      {err && <div className="text-red-500 mb-4">{err}</div>}

      {/* Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 태스크</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="제목"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <Input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
            <Select
              value={status}
              onValueChange={(value: "todo" | "doing" | "done") =>
                setStatus(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">할 일</SelectItem>
                <SelectItem value="doing">진행중</SelectItem>
                <SelectItem value="done">완료</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createTask}>생성</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
