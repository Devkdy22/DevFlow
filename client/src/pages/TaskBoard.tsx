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
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Textarea } from "../components/ui/textarea";
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
  status?: "todo" | "doing" | "done";
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  memo?: string;
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
  const [memo, setMemo] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<
    "todo" | "doing" | "done" | null
  >(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<"todo" | "doing" | "done">(
    "todo"
  );
  const [editDueDate, setEditDueDate] = useState("");
  const [editProjectId, setEditProjectId] = useState<string>("");
  const [editMemo, setEditMemo] = useState("");
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [searchParams] = useSearchParams();
  const currentEditTask = items.find(t => t._id === editId);
  const highlightId = searchParams.get("highlight") || "";
  const [isHighlighting, setIsHighlighting] = useState(false);

  const showToast = (message: string) => {
    setToast({ message });
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 2400);
  };

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
      showToast(msg || "태스크 로드 실패");
    }
  };

  // useEffect(() => {
  //   load();
  // }, []);
  useEffect(() => {
    api.get<Project[]>("/api/projects").then(res => {
      setProjects(res.data);

      if (res.data.length > 0) {
        const queryProjectId = searchParams.get("projectId") || "";
        const exists = res.data.some(p => p._id === queryProjectId);
        const nextId = exists ? queryProjectId : res.data[0]._id;
        setSelectedProjectId(nextId);

        if (queryProjectId && !exists) {
          showToast("선택한 프로젝트를 찾을 수 없습니다.");
        }
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (!selectedProjectId) return;
    load(selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    if (!highlightId) return;
    setIsHighlighting(true);
    const t = window.setTimeout(() => setIsHighlighting(false), 2500);
    return () => window.clearTimeout(t);
  }, [highlightId]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      showToast("프로젝트를 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      showToast("제목을 입력해주세요.");
      return;
    }

    try {
      const isoDue = dueDate ? new Date(dueDate).toISOString() : undefined;

      const res = await api.post("/api/tasks", {
        title,
        projectId: selectedProjectId, // 🔥 현재 선택된 프로젝트
        status,
        dueDate: isoDue,
        memo: memo || undefined,
      });

      // 🔥 보드 즉시 갱신
      setItems(prev => [res.data, ...prev]);

      // 🔥 입력값 초기화
      setTitle("");
      setStatus("todo");
      setDueDate("");
      setMemo("");

      // 🔥 팝업 닫기
      setOpen(false);
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || "태스크 생성 실패");
    }
  };

  const updateTaskStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await api.put(`/api/tasks/${id}`, { status: nextStatus });
      setItems(s => s.map(t => (t._id === id ? res.data : t)));
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || "업데이트 실패");
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("태스크를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      setItems(s => s.filter(t => t._id !== id));
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || "삭제 실패");
    }
  };

  const openEdit = (task: Task) => {
    setEditId(task._id);
    setEditTitle(task.title ?? "");
    setEditStatus(task.status ?? "todo");
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 16) : "");
    setEditProjectId(task.projectId ?? selectedProjectId);
    setEditMemo(task.memo ?? "");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editId) return;
    if (!editTitle.trim()) {
      showToast("제목을 입력해주세요.");
      return;
    }
    if (!editProjectId) {
      showToast("프로젝트를 선택해주세요.");
      return;
    }
    try {
      const isoDue = editDueDate
        ? new Date(editDueDate).toISOString()
        : undefined;
      const res = await api.put(`/api/tasks/${editId}`, {
        title: editTitle,
        status: editStatus,
        dueDate: isoDue,
        projectId: editProjectId,
        memo: editMemo || undefined,
      });
      setItems(s => s.map(t => (t._id === editId ? res.data : t)));
      setEditOpen(false);
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || "수정 실패");
    }
  };

  const onDragStart = (task: Task) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task._id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(task._id);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const onDropColumn =
    (nextStatus: "todo" | "doing" | "done") =>
    (e: React.DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const task = items.find(t => t._id === id);
      if (!task || task.status === nextStatus) return;
      updateTaskStatus(id, nextStatus);
      setDragOverCol(null);
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

  const statusLabel: Record<"todo" | "doing" | "done", string> = {
    todo: "할 일",
    doing: "진행 중",
    done: "완료",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900">
      <style>
        {`
          @keyframes wiggle {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(1.2deg); }
            50% { transform: rotate(-1.2deg); }
            75% { transform: rotate(1deg); }
            100% { transform: rotate(0deg); }
          }
        `}
      </style>
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
          <Card className="p-4 bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              프로젝트 선택
            </div>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="프로젝트를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {projects.map(project => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["todo", "doing", "done"] as const).map(col => (
            <div
              key={col}
              className={`flex flex-col rounded-2xl p-2 transition ${
                dragOverCol === col ? "bg-indigo-50/70" : "bg-transparent"
              }`}
              onDragOver={e => {
                e.preventDefault();
                setDragOverCol(col);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={onDropColumn(col)}
            >
              <div
                className={`mb-4 px-4 py-2 rounded-xl bg-gradient-to-r ${colMap[col].color} text-white`}
              >
                {colMap[col].title} ({columns[col].length})
              </div>

              <div className="space-y-3 flex-1">
                <AnimatePresence>
                  {columns[col].map(task => (
                    <motion.div key={task._id} layout>
                      <Card
                        className={`p-4 backdrop-blur bg-white/50 dark:bg-slate-800/50 cursor-pointer transition ${
                          draggingId === task._id
                            ? "opacity-50"
                            : "hover:shadow-lg"
                        } ${
                          highlightId === task._id && isHighlighting
                            ? "ring-4 ring-amber-300/90 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-[pulse_1.5s_ease-in-out_infinite] animate-[wiggle_0.4s_ease-in-out_infinite]"
                            : ""
                        }`}
                        draggable
                        onDragStart={onDragStart(task)}
                        onDragEnd={onDragEnd}
                        onClick={() => openEdit(task)}
                      >
                        <div className="flex justify-between mb-2">
                          <h3>{task.title}</h3>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteTask(task._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>

                        {task.dueDate && (
                          <div className="text-sm flex items-center gap-1 text-gray-500">
                            <Clock className="h-4 w-4" />
                            마감일:{" "}
                            {new Date(task.dueDate).toLocaleString()}
                          </div>
                        )}

                        {(task.createdAt || task.updatedAt) && (
                          <div className="mt-2 text-xs text-slate-500">
                            {task.createdAt && (
                              <span>
                                작성:{" "}
                                {new Date(task.createdAt).toLocaleString()}
                              </span>
                            )}
                            {task.updatedAt && (
                              <span className="ml-2">
                                수정:{" "}
                                {new Date(task.updatedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                        {task.memo && (
                          <div className="mt-2 text-xs text-slate-600">
                            메모: {task.memo}
                          </div>
                        )}

                        <div className="flex justify-between mt-3">
                          {col !== "done" && (
                            <Button
                              size="sm"
                              onClick={e => {
                                e.stopPropagation();
                                updateTaskStatus(
                                  task._id,
                                  col === "todo" ? "doing" : "done"
                                );
                              }}
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
      {/* Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void createTask(e as any);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>새 태스크</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              작성일: {new Date().toLocaleString()}
            </div>
            <Input
              placeholder="제목"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
            <div>
              <div className="text-xs text-slate-500 mb-1">마감일</div>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">메모</div>
              <Textarea
                placeholder="메모를 입력하세요"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                rows={3}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value: "todo" | "doing" | "done") =>
                setStatus(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">{statusLabel.todo}</SelectItem>
                <SelectItem value="doing">{statusLabel.doing}</SelectItem>
                <SelectItem value="done">{statusLabel.done}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createTask}>생성</Button>
            <div className="text-xs text-slate-500">
              단축키: ⌘/Ctrl+Enter 생성
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60]">
          <div className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm shadow-lg">
            {toast.message}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void saveEdit();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>태스크 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(currentEditTask?.createdAt || currentEditTask?.updatedAt) && (
              <div className="text-xs text-slate-500">
                {currentEditTask.createdAt && (
                  <span>
                    작성:{" "}
                    {new Date(currentEditTask.createdAt).toLocaleString()}
                  </span>
                )}
                {currentEditTask.updatedAt && (
                  <span className="ml-2">
                    수정:{" "}
                    {new Date(currentEditTask.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}
            <div>
              <div className="text-xs text-slate-500 mb-1">프로젝트</div>
              <Select
                value={editProjectId}
                onValueChange={setEditProjectId}
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
            <Input
              placeholder="제목"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
            <div>
              <div className="text-xs text-slate-500 mb-1">마감일</div>
              <Input
                type="datetime-local"
                value={editDueDate}
                onChange={e => setEditDueDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">메모</div>
              <Textarea
                placeholder="메모를 입력하세요"
                value={editMemo}
                onChange={e => setEditMemo(e.target.value)}
                rows={3}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <Select
              value={editStatus}
              onValueChange={(value: "todo" | "doing" | "done") =>
                setEditStatus(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">{statusLabel.todo}</SelectItem>
                <SelectItem value="doing">{statusLabel.doing}</SelectItem>
                <SelectItem value="done">{statusLabel.done}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={saveEdit}>저장</Button>
            <div className="text-xs text-slate-500">
              단축키: ⌘/Ctrl+Enter 저장
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
