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
  const [filterProjectId, setFilterProjectId] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
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
    if (qp) {
      setProjectId(qp);
      setFilterProjectId(qp);
    } else {
      setFilterProjectId("all");
    }
    load();
  }, [searchParams]);

  useEffect(() => {
    const qp = searchParams.get("projectId") || "";
    if (!qp) return;
    if (projects.some(p => p._id === qp)) {
      setProjectId(qp);
      setFilterProjectId(qp);
    }
  }, [projects, searchParams]);

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
      setCreateOpen(false);
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

  const projectNameById = useMemo(
    () =>
      projects.reduce<Record<string, string>>((acc, project) => {
        acc[project._id] = project.title;
        return acc;
      }, {}),
    [projects]
  );

  const visibleRetroGroups = useMemo(() => {
    if (filterProjectId === "all") {
      return Array.from(retrosByProject.entries()).sort((a, b) => {
        const aKey = a[0];
        const bKey = b[0];
        const aName =
          aKey === "unassigned" ? "프로젝트 미지정" : projectNameById[aKey] ?? "알 수 없는 프로젝트";
        const bName =
          bKey === "unassigned" ? "프로젝트 미지정" : projectNameById[bKey] ?? "알 수 없는 프로젝트";
        return aName.localeCompare(bName, "ko");
      });
    }
    return [[filterProjectId, retrosByProject.get(filterProjectId) ?? []]] as const;
  }, [filterProjectId, retrosByProject, projectNameById]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-[#4F46E5]" />
            <h1 className="text-gray-900 dark:text-white">프로젝트 회고</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              작성된 회고를 중심으로 모아보고 필요할 때 작성하세요
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              대시보드
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white"
            >
              회고 작성
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-white/70 dark:border-slate-700/70 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  회고 목록
                </div>
                <Select value={filterProjectId} onValueChange={setFilterProjectId}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="프로젝트 필터" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="all">전체 프로젝트</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {visibleRetroGroups.map(([groupProjectId, retros]) => {
              const groupName =
                groupProjectId === "unassigned"
                  ? "프로젝트 미지정"
                  : projectNameById[groupProjectId] ?? "알 수 없는 프로젝트";
              return (
                <Card
                  key={groupProjectId}
                  className="p-5 bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-white/70 dark:border-slate-700/70 shadow-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      {groupName}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {retros.length}개
                    </span>
                  </div>

                  <div className="space-y-3">
                    {retros.map(r => (
                      <motion.div
                        key={r._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{
                          scale: 1.006,
                          borderColor: "rgba(99,102,241,0.45)",
                        }}
                        whileTap={{ scale: 0.995 }}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/70 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/15 hover:shadow-md transition-all duration-200"
                      >
                        <p className="text-sm leading-6 text-slate-700 dark:text-slate-100 whitespace-pre-wrap">
                          {r.content}
                        </p>
                        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          {r.updatedAt && r.updatedAt !== r.createdAt
                            ? `마지막 수정: ${new Date(r.updatedAt).toLocaleString()}`
                            : r.createdAt
                            ? `작성: ${new Date(r.createdAt).toLocaleString()}`
                            : ""}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
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
                      </motion.div>
                    ))}
                    {retros.length === 0 && (
                      <div className="text-sm text-slate-500">회고가 없습니다.</div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="space-y-6">
            <Card className="p-6 sticky top-24 bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-white/70 dark:border-slate-700/70 shadow-xl">
              <div className="text-sm text-slate-500 dark:text-slate-400">전체 회고</div>
              <div className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">
                {items.length}
              </div>
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                작성된 회고를 먼저 확인하고, 필요할 때 상단 버튼으로 새 회고를 작성하세요.
              </div>
              <Button
                className="mt-4 w-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white"
                onClick={() => setCreateOpen(true)}
              >
                새 회고 작성
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className="sm:max-w-3xl max-h-[86vh] overflow-hidden"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void createRetro(e as any);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>회고 작성</DialogTitle>
          </DialogHeader>
          <form onSubmit={createRetro} className="space-y-4 overflow-y-auto pr-1">
            <div className="text-xs text-slate-500">작성일: {new Date().toLocaleString()}</div>
            <div>
              <Label>프로젝트 (선택)</Label>
              <Select value={projectId} onValueChange={value => setProjectId(value)}>
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
                rows={11}
                required
                className="mt-2 resize-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            {err && <div className="text-red-500 text-sm">{err}</div>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                취소
              </Button>
              <Button type="submit">작성</Button>
            </div>
            <div className="text-xs text-slate-500">단축키: ⌘/Ctrl+Enter 작성</div>
          </form>
        </DialogContent>
      </Dialog>

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
