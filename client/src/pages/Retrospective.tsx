import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";

type Retro = {
  _id: string;
  projectId?: string;
  content: string;
  userId?: string;
};

export default function Retrospective() {
  const [items, setItems] = useState<Retro[]>([]);
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const load = async () => {
    try {
      const res = await api.get("/api/retros");
      setItems(res.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return nav("/login");
      setErr(getErrorMessage(error) || "회고 로드 실패");
    }
  };

  useEffect(() => {
    load();
  }, []);

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
    <div style={{ padding: 20 }}>
      <h2>Retros</h2>

      <form onSubmit={createRetro} style={{ marginBottom: 12 }}>
        <input
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          placeholder="projectId (선택)"
        />
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="회고 내용"
          required
        />
        <button type="submit">생성</button>
      </form>

      {err && <div style={{ color: "red" }}>{err}</div>}

      <ul>
        {items.map(r => (
          <li key={r._id} style={{ marginBottom: 6 }}>
            {r.projectId ? <small>[{r.projectId}] </small> : null}
            {r.content}
            <button
              style={{ marginLeft: 8 }}
              onClick={() => deleteRetro(r._id)}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
