import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";

type Project = { _id: string; title: string; description?: string };

type ProjectFormProps = {
  onBack?: () => void;
};

export function ProjectForm({ onBack }: ProjectFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const load = async () => {
    try {
      const res = await api.get("/api/projects");
      setProjects(res.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return nav("/login");
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
    <div style={{ padding: 20 }}>
      {onBack && (
        <button type="button" onClick={onBack} style={{ marginBottom: 12 }}>
          대시보드로 돌아가기
        </button>
      )}
      <h2>Projects</h2>

      <form onSubmit={createProject} style={{ marginBottom: 12 }}>
        <input
          placeholder="제목"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="설명"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button type="submit">생성</button>
      </form>

      {err && <div style={{ color: "red" }}>{err}</div>}

      <ul>
        {projects.map(p => (
          <li key={p._id} style={{ marginBottom: 6 }}>
            <strong>{p.title}</strong> — {p.description}
            <button
              style={{ marginLeft: 8 }}
              onClick={() => nav(`/projects/${p._id}`)}
            >
              보기
            </button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => deleteProject(p._id)}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
