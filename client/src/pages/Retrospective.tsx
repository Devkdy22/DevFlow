import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { FileText } from "lucide-react";
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
};

type Project = {
  _id: string;
  title: string;
};

export function Retrospective() {
  const [items, setItems] = useState<Retro[]>([]);
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

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
    load();
  }, []);

  const projectNameMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach(p => {
      map.set(p._id, p.title);
    });
    return map;
  }, [projects]);

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
      setProjectId("");
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "회고 생성 실패");
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
            <form onSubmit={createRetro}>
              <Card className="p-8 mb-6 bg-white/70 backdrop-blur-xl shadow-xl">
                <div className="space-y-6">
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
                      className="mt-2 resize-none"
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
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 text-gray-900">작성된 회고</h3>

              <ul className="space-y-3">
                {items.map(r => (
                  <li
                    key={r._id}
                    className="p-4 rounded-xl bg-white border hover:shadow-md transition-shadow"
                  >
                    {r.projectId && (
                      <div className="text-xs text-gray-500 mb-1">
                        Project:{" "}
                        {projectNameMap.get(r.projectId) ??
                          "알 수 없는 프로젝트"}
                      </div>
                    )}

                    <p className="text-gray-800 mb-3">{r.content}</p>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteRetro(r._id)}
                    >
                      삭제
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
