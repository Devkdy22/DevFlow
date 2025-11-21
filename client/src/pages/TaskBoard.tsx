import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";

type Task = {
  _id: string;
  title: string;
  projectId?: string;
  status?: string;
  dueDate?: string;
};

export default function Tasks() {
  const [items, setItems] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const load = async () => {
    try {
      const res = await api.get("/api/tasks");
      setItems(res.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return nav("/login");
      const msg = getErrorMessage(error);
      setErr(msg || "태스크 로드 실패");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const isoDue = dueDate ? new Date(dueDate).toISOString() : undefined;
      const res = await api.post("/api/tasks", {
        title,
        projectId: projectId || undefined,
        status,
        dueDate: isoDue,
      });
      setItems(s => [res.data, ...s]);
      setTitle("");
      setProjectId("");
      setStatus("todo");
      setDueDate("");
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

  return (
    <div style={{ padding: 20 }}>
      <h2>Tasks</h2>

      <form onSubmit={createTask} style={{ marginBottom: 12 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목"
          required
        />
        <input
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          placeholder="projectId (선택)"
        />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="todo">할 일</option>
          <option value="doing">진행중</option>
          <option value="done">완료</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <button type="submit">생성</button>
      </form>

      {err && <div style={{ color: "red" }}>{err}</div>}

      <ul>
        {items.map(t => (
          <li key={t._id} style={{ marginBottom: 6 }}>
            <strong>{t.title}</strong> ({t.status})
            {t.dueDate && ` — ${new Date(t.dueDate).toLocaleDateString()}`}
            <button
              style={{ marginLeft: 8 }}
              onClick={() =>
                updateTaskStatus(t._id, t.status === "done" ? "todo" : "done")
              }
            >
              상태 토글
            </button>
            <button style={{ marginLeft: 8 }} onClick={() => deleteTask(t._id)}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
