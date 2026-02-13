import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { FolderPlus, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

type Project = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  priority?: "낮음" | "보통" | "높음";
  createdAt?: string;
  updatedAt?: string;
};

export function ProjectForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"낮음" | "보통" | "높음">("보통");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState<
    "낮음" | "보통" | "높음"
  >("보통");
  const [editInitial, setEditInitial] = useState({
    title: "",
    description: "",
    category: "",
    priority: "보통" as "낮음" | "보통" | "높음",
  });

  const currentEdit = projects.find(p => p._id === editId);

  const load = async () => {
    try {
      const res = await api.get("/api/projects");
      setProjects(res.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return navigate("/login");
      setProjects([]);
      setErr(getErrorMessage(error) || "프로젝트 로드 실패");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/api/projects", {
        title,
        description,
        category,
        priority,
      });
      setProjects(s => [res.data, ...s]);
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("보통");
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "프로젝트 생성 실패");
    }
  };

  const openEdit = (project: Project) => {
    setEditId(project._id);
    setEditTitle(project.title ?? "");
    setEditDescription(project.description ?? "");
    setEditCategory(project.category ?? "");
    setEditPriority(project.priority ?? "보통");
    setEditInitial({
      title: project.title ?? "",
      description: project.description ?? "",
      category: project.category ?? "",
      priority: project.priority ?? "보통",
    });
    setEditOpen(true);
  };

  const updateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setErr("");
    try {
      const res = await api.put(`/api/projects/${editId}`, {
        title: editTitle,
        description: editDescription,
        category: editCategory,
        priority: editPriority,
      });
      setProjects(s => s.map(p => (p._id === editId ? res.data : p)));
      setEditOpen(false);
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "프로젝트 수정 실패");
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("프로젝트를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects(s => s.filter(p => p._id !== id));
      if (editId === id) {
        setEditOpen(false);
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error) || "삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FolderPlus className="h-8 w-8 text-[#4F46E5]" />
            <h1 className="text-gray-900 dark:text-white">새 프로젝트 등록</h1>
          </div>
          <p className="text-gray-600 dark:text-slate-400">
            프로젝트 정보를 입력하세요
          </p>
        </div>

        {/* Create Form */}
        <form onSubmit={createProject}>
          <Card className="p-8 mb-6 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl shadow-xl">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-[#4F46E5]" />
                <span className="text-gray-900 dark:text-white">기본 정보</span>
              </h2>

              <div className="text-xs text-slate-500 mb-4">
                작성일: {new Date().toLocaleString()}
              </div>

              <div className="space-y-6">
                <div>
                  <Label>프로젝트 명 *</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="예: E-Commerce Platform"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>프로젝트 설명</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                {/* UI용 옵션 (API 영향 없음) */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Select
                    value={category}
                    onValueChange={value => setCategory(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="웹">웹</SelectItem>
                      <SelectItem value="모바일">모바일</SelectItem>
                      <SelectItem value="백엔드">백엔드</SelectItem>
                      <SelectItem value="AI">AI</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={priority}
                    onValueChange={value =>
                      setPriority(value as "낮음" | "보통" | "높음")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="우선순위 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="높음">높음</SelectItem>
                      <SelectItem value="보통">보통</SelectItem>
                      <SelectItem value="낮음">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {err && <div className="text-red-500 mb-4">{err}</div>}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white"
            >
              프로젝트 생성
            </Button>
          </div>
        </form>

        {/* Project List */}
        <ul className="mt-10 space-y-3">
          {projects.map(p => (
            <li
              key={p._id}
              className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 p-4 rounded-lg"
            >
              <div>
                <strong className="text-gray-900 dark:text-white">
                  {p.title}
                </strong>
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  {p.description}
                </div>
                {(p.createdAt || p.updatedAt) && (
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    {p.createdAt && (
                      <span>
                        작성: {new Date(p.createdAt).toLocaleString()}
                      </span>
                    )}
                    {p.updatedAt && (
                      <span className="ml-2">
                        수정: {new Date(p.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => openEdit(p)}>
                  보기
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={next => {
          if (!next) {
            const dirty =
              editTitle !== editInitial.title ||
              editDescription !== editInitial.description ||
              editCategory !== editInitial.category ||
              editPriority !== editInitial.priority;
            if (dirty && !confirm("변경사항이 있습니다. 닫을까요?")) {
              return;
            }
          }
          setEditOpen(next);
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void updateProject(e as any);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>프로젝트 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={updateProject} className="space-y-4">
            {(currentEdit?.createdAt || currentEdit?.updatedAt) && (
              <div className="text-xs text-slate-500">
                {currentEdit.createdAt && (
                  <span>
                    작성: {new Date(currentEdit.createdAt).toLocaleString()}
                  </span>
                )}
                {currentEdit.updatedAt && (
                  <span className="ml-2">
                    수정: {new Date(currentEdit.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}
            <div>
              <Label>프로젝트 명 *</Label>
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <Label>프로젝트 설명</Label>
              <Textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                rows={4}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                value={editCategory}
                onValueChange={value => setEditCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="웹">웹</SelectItem>
                  <SelectItem value="모바일">모바일</SelectItem>
                  <SelectItem value="백엔드">백엔드</SelectItem>
                  <SelectItem value="AI">AI</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={editPriority}
                onValueChange={value =>
                  setEditPriority(value as "낮음" | "보통" | "높음")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="우선순위 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="높음">높음</SelectItem>
                  <SelectItem value="보통">보통</SelectItem>
                  <SelectItem value="낮음">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {err && <div className="text-red-500 text-sm">{err}</div>}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                취소
              </Button>
              <Button type="submit">저장</Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => editId && deleteProject(editId)}
              >
                삭제
              </Button>
            </div>
            <div className="text-xs text-slate-500">
              단축키: ⌘/Ctrl+Enter 저장
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
