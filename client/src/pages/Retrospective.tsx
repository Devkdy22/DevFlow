import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import api from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../utils/error";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { FileText } from "lucide-react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

type Retro = {
  _id: string;
  projectId?: string;
  content: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Project = {
  _id: string;
  title: string;
};

export function Retrospective() {
  const [items, setItems] = useState<Retro[]>([]);
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchParams] = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editProjectId, setEditProjectId] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editInitial, setEditInitial] = useState({
    projectId: "",
    content: "",
  });

  const load = async () => {
    try {
      const [retrosRes, projectsRes] = await Promise.all([
        api.get<Retro[]>("/api/retros"),
        api.get<Project[]>("/api/projects"),
      ]);

      setItems(retrosRes.data || []);

      // 프로젝트 중복 제거 (_id 기준)
      const uniqueProjects = [
        ...new Map(projectsRes.data.map(p => [p._id, p])).values(),
      ];

      setProjects(uniqueProjects);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return navigate("/login");
      setErr(getErrorMessage(error) || "회고 로드 실패");
    }
  };

  useEffect(() => {
    const qp = searchParams.get("projectId") || "";
    if (qp) setProjectId(qp);
    load();
  }, [searchParams]);

  useEffect(() => {
    const qp = searchParams.get("projectId") || "";
    if (!qp) return;
    if (projects.some(p => p._id === qp)) {
      setProjectId(qp);
    }
  }, [projects, searchParams]);

  const projectNameMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach(p => {
      map.set(p._id, p.title);
    });
    return map;
  }, [projects]);

  const retrosByProject = useMemo(() => {
    const map = new Map<string, Retro[]>();
    items.forEach(r => {
      const key = r.projectId ?? "unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    map.forEach(list => {
      list.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    });
    return map;
  }, [items]);

  useEffect(() => {
    if (filterProjectId) return;
    if (projectId) {
      setFilterProjectId(projectId);
      return;
    }
    if (projects.length > 0) {
      setFilterProjectId(projects[0]._id);
    }
  }, [projectId, projects, filterProjectId]);

  const createRetro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/api/retros", {
        projectId: projectId || undefined,
        content,
      });
      setItems(s => [res.data, ...s]);
      setContent("");
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "회고 생성 실패");
    }
  };

  const openEdit = (retro: Retro) => {
    setEditId(retro._id);
    setEditProjectId(retro.projectId ?? "");
    setEditContent(retro.content ?? "");
    setEditInitial({
      projectId: retro.projectId ?? "",
      content: retro.content ?? "",
    });
    setEditOpen(true);
  };

  const updateRetro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setErr("");
    try {
      const res = await api.put(`/api/retros/${editId}`, {
        projectId: editProjectId || undefined,
        content: editContent,
      });
      setItems(s => s.map(r => (r._id === editId ? res.data : r)));
      setEditOpen(false);
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "회고 수정 실패");
    }
  };

  const deleteRetro = async (id: string) => {
    if (!confirm("회고를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/retros/${id}`);
      setItems(s => s.filter(r => r._id !== id));
    } catch (error: unknown) {
      alert(getErrorMessage(error) || "삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-[#4F46E5]" />
            <h1 className="text-gray-900 dark:text-white">프로젝트 회고</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            프로젝트를 돌아보고 개선점을 기록하세요
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={createRetro}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void createRetro(e as any);
                }
              }}
            >
              <Card className="p-8 mb-6 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl shadow-xl">
                <div className="space-y-6">
                  <div className="text-xs text-slate-500">
                    작성일: {new Date().toLocaleString()}
                  </div>
                  <div>
                    <Label>프로젝트 선택 (선택)</Label>
                    <Select
                      value={projectId}
                      onValueChange={value => setProjectId(value)}
                    >
                      <SelectTrigger className="mt-2">
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
                  </div>

                  <div>
                    <Label>회고 내용 *</Label>
                  <Textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="이번 프로젝트에서 느낀 점을 자유롭게 작성하세요"
                      rows={6}
                      required
                      className="mt-2 resize-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
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
                  대시보드로
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white"
                >
                  회고 생성
                </Button>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                단축키: ⌘/Ctrl+Enter 생성
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-white/70 dark:bg-slate-800/60">
              <h3 className="mb-4 text-gray-900 dark:text-white">
                작성된 회고
              </h3>

              <div className="space-y-4">
                <div>
                  <Label>프로젝트 필터</Label>
                  <Select
                    value={filterProjectId}
                    onValueChange={value => setFilterProjectId(value)}
                  >
                    <SelectTrigger className="mt-2">
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
                </div>

                <ul className="space-y-3">
                  {(retrosByProject.get(filterProjectId) || []).map(r => (
                    <motion.li
                      key={r._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/70 hover:shadow-md transition-shadow"
                    >
                      <p className="text-gray-800 dark:text-slate-100 mb-2">
                        {r.content}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        {r.updatedAt && r.updatedAt !== r.createdAt
                          ? `마지막 수정: ${new Date(
                              r.updatedAt
                            ).toLocaleString()}`
                          : r.createdAt
                          ? `작성: ${new Date(
                              r.createdAt
                            ).toLocaleString()}`
                          : ""}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(r)}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteRetro(r._id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                  {filterProjectId &&
                    (retrosByProject.get(filterProjectId) || []).length ===
                      0 && (
                      <div className="text-sm text-slate-500">
                        선택한 프로젝트에 회고가 없습니다.
                      </div>
                    )}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={next => {
          if (!next) {
            const dirty =
              editProjectId !== editInitial.projectId ||
              editContent !== editInitial.content;
            if (dirty && !confirm("변경사항이 있습니다. 닫을까요?")) {
              return;
            }
          }
          setEditOpen(next);
        }}
      >
        <DialogContent
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void updateRetro(e as any);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>회고 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={updateRetro} className="space-y-4">
            <div>
              <Label>프로젝트 (선택)</Label>
              <Select
                value={editProjectId}
                onValueChange={value => setEditProjectId(value)}
              >
                <SelectTrigger className="mt-2">
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
            </div>

            <div>
              <Label>회고 내용 *</Label>
              <Textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={6}
                required
                className="mt-2 resize-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
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
