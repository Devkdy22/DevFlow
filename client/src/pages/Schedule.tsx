import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";

type Schedule = {
  _id: string;
  title: string;
  date?: string;
  category?: string;
  userId?: string;
};

type SchedulePageProps = {
  onBack?: () => void;
};

export function Schedule({ onBack }: SchedulePageProps) {
  const [items, setItems] = useState<Schedule[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const load = async () => {
    try {
      const res = await api.get("/api/schedules");
      setItems(res.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return nav("/login");
      setErr(getErrorMessage(error) || "일정 로드 실패");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const isoDate = date ? new Date(date).toISOString() : undefined;
      const res = await api.post("/api/schedules", {
        title,
        date: isoDate,
        category,
      });
      setItems(s => [res.data, ...s]);
      setTitle("");
      setDate("");
      setCategory("");
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "일정 생성 실패");
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm("일정을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/schedules/${id}`);
      setItems(s => s.filter(i => i._id !== id));
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
      <h2>Schedules</h2>

      <form onSubmit={createSchedule} style={{ marginBottom: 12 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="일정 제목"
          required
        />
        <input
          type="datetime-local"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <input
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="카테고리"
        />
        <button type="submit">생성</button>
      </form>

      {err && <div style={{ color: "red" }}>{err}</div>}

      <ul>
        {items.map(s => (
          <li key={s._id} style={{ marginBottom: 6 }}>
            <strong>{s.title}</strong>
            {s.date && ` — ${new Date(s.date).toLocaleString()}`}
            {s.category && ` (${s.category})`}
            <button
              style={{ marginLeft: 8 }}
              onClick={() => deleteSchedule(s._id)}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
