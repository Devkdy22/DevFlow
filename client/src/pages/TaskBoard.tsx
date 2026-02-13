import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import api from "../services/api";
import {
  Kanban,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../utils/error";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { TechBackground } from "../components/TechBackground";
import { TaskColumn } from "../components/task/TaskColumn";
import { TaskFormDialog } from "../components/task/TaskFormDialog";
import { TopToast } from "../components/common/TopToast";
import {
  toIsoStringOrUndefined,
  toLocalDateTimeInputValue,
} from "../utils/dateTime";

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

const ALL_PROJECTS = "all";

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
  const [projectSelectionReady, setProjectSelectionReady] = useState(false);
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
    const params =
      projectId && projectId !== ALL_PROJECTS ? { projectId } : undefined;
    try {
      const tasksRes = await api.get<Task[]>("/api/tasks", { params });
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
    setProjectSelectionReady(false);
    api.get<Project[]>("/api/projects").then(res => {
      setProjects(res.data);

      const queryProjectId = searchParams.get("projectId") || "";
      const exists = res.data.some(p => p._id === queryProjectId);

      if (queryProjectId && exists) {
        setSelectedProjectId(queryProjectId);
      } else if (!queryProjectId) {
        setSelectedProjectId(ALL_PROJECTS);
      } else {
        setSelectedProjectId(ALL_PROJECTS);
        showToast("선택한 프로젝트를 찾을 수 없어 전체 태스크를 표시합니다.");
      }
      setProjectSelectionReady(true);
    });
  }, [searchParams]);

  useEffect(() => {
    if (!projectSelectionReady) return;
    load(selectedProjectId);
  }, [selectedProjectId, projectSelectionReady]);

  useEffect(() => {
    if (!highlightId) return;
    setIsHighlighting(true);
    const t = window.setTimeout(() => setIsHighlighting(false), 2500);
    return () => window.clearTimeout(t);
  }, [highlightId]);

  const createTask = async () => {
    if (!selectedProjectId || selectedProjectId === ALL_PROJECTS) {
      showToast("프로젝트를 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      showToast("제목을 입력해주세요.");
      return;
    }

    try {
      const isoDue = toIsoStringOrUndefined(dueDate);

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
    setEditDueDate(toLocalDateTimeInputValue(task.dueDate));
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
      const isoDue = toIsoStringOrUndefined(editDueDate);
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

  const onDragStart = (task: Task, e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task._id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(task._id);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const onDropColumn = (
    nextStatus: "todo" | "doing" | "done",
    e: React.DragEvent
  ) => {
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

  const projectNameById = useMemo(
    () =>
      projects.reduce<Record<string, string>>((acc, project) => {
        acc[project._id] = project.title;
        return acc;
      }, {}),
    [projects]
  );

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
                <SelectItem value={ALL_PROJECTS}>전체 프로젝트</SelectItem>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {(["todo", "doing", "done"] as const).map((col, index) => (
            <motion.div
              key={col}
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: index * 0.03 }}
            >
              <TaskColumn
                column={col}
                title={colMap[col].title}
                colorClassName={colMap[col].color}
                tasks={columns[col]}
                dragOver={dragOverCol === col}
                draggingId={draggingId}
                highlightId={highlightId}
                isHighlighting={isHighlighting}
                onDragEnterColumn={setDragOverCol}
                onDragLeaveColumn={() => setDragOverCol(null)}
                onDropColumn={onDropColumn}
                onDragStartTask={onDragStart}
                onDragEndTask={onDragEnd}
                onOpenTask={openEdit}
                onDeleteTask={deleteTask}
                onAdvanceTask={task =>
                  updateTaskStatus(task._id, col === "todo" ? "doing" : "done")
                }
                showProjectName={selectedProjectId === ALL_PROJECTS}
                getProjectName={projectId =>
                  projectId
                    ? projectNameById[projectId] ?? "알 수 없는 프로젝트"
                    : "프로젝트 미지정"
                }
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <TaskFormDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        title="새 태스크"
        submitLabel="생성"
        onSubmit={createTask}
        taskTitle={title}
        onChangeTaskTitle={setTitle}
        dueDate={dueDate}
        onChangeDueDate={setDueDate}
        memo={memo}
        onChangeMemo={setMemo}
        status={status}
        onChangeStatus={setStatus}
      />

      {toast && <TopToast message={toast.message} />}

      <TaskFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        title="태스크 수정"
        submitLabel="저장"
        onSubmit={saveEdit}
        taskTitle={editTitle}
        onChangeTaskTitle={setEditTitle}
        dueDate={editDueDate}
        onChangeDueDate={setEditDueDate}
        memo={editMemo}
        onChangeMemo={setEditMemo}
        status={editStatus}
        onChangeStatus={setEditStatus}
        showProjectSelect
        projectId={editProjectId}
        onChangeProjectId={setEditProjectId}
        projects={projects}
        createdAt={currentEditTask?.createdAt}
        updatedAt={currentEditTask?.updatedAt}
      />
    </div>
  );
}
