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

type Project = { _id: string; title: string; description?: string };

export function ProjectForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

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
      const res = await api.post("/api/projects", { title, description });
      setProjects(s => [res.data, ...s]);
      setTitle("");
      setDescription("");
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "프로젝트 생성 실패");
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("프로젝트를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects(s => s.filter(p => p._id !== id));
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
            <h1>새 프로젝트 등록</h1>
          </div>
          <p className="text-gray-600">프로젝트 정보를 입력하세요</p>
        </div>

        {/* Create Form */}
        <form onSubmit={createProject}>
          <Card className="p-8 mb-6 bg-white/70 backdrop-blur-xl shadow-xl">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-[#4F46E5]" />
                기본 정보
              </h2>

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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">웹</SelectItem>
                      <SelectItem value="mobile">모바일</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="우선순위 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="low">낮음</SelectItem>
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
              className="flex justify-between items-center bg-white/60 p-4 rounded-lg"
            >
              <div>
                <strong>{p.title}</strong>
                <div className="text-sm text-gray-500">{p.description}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => navigate(`/projects/${p._id}`)}
                >
                  보기
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteProject(p._id)}
                >
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
