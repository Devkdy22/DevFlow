import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/error";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
  Trash2,
} from "lucide-react";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import { motion, AnimatePresence } from "motion/react";
import { TechBackground } from "../components/TechBackground";

type Schedule = {
  _id: string;
  title: string;
  date?: string;
  category?: string;
  userId?: string;
};

export function Schedule() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/api/schedules");
      setItems(res.data || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return navigate("/login");
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

  /** -------------------------------
   * 캘린더 계산
   -------------------------------- */
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay });

  const eventsByDate = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    items.forEach(item => {
      if (!item.date) return;
      const key = item.date.split("T")[0];
      map[key] = map[key] || [];
      map[key].push(item);
    });
    return map;
  }, [items]);

  const getDateKey = (d: Date) => d.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      <TechBackground />

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-gray-900 dark:text-white">일정 관리</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              개인 일정과 프로젝트 일정을 관리하세요
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              대시보드
            </Button>
            <Button
              onClick={() => setOpenCreate(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> 새 일정
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="lg:col-span-2 p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="dark:text-white">
                {currentDate.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                })}
              </h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentDate(new Date(year, month - 1))}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentDate(new Date(year, month + 1))}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["일", "월", "화", "수", "목", "금", "토"].map(d => (
                <div key={d} className="text-center text-gray-500 text-sm">
                  {d}
                </div>
              ))}

              {emptyDays.map((_, i) => (
                <div key={i} />
              ))}

              {days.map(day => {
                const dateObj = new Date(year, month, day);
                const key = getDateKey(dateObj);
                const dayEvents = eventsByDate[key] || [];
                const isSelected =
                  selectedDate?.toDateString() === dateObj.toDateString();

                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDate(dateObj)}
                    whileHover={{ scale: 1.1 }}
                    className={`aspect-square rounded-lg p-2 relative transition ${
                      isSelected
                        ? "bg-indigo-500/20 ring-2 ring-indigo-500"
                        : "bg-white/20 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-sm">{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                        {dayEvents.slice(0, 3).map((_, i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {/* Selected Day */}
          <Card className="p-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl shadow-2xl">
            <h3 className="mb-4 dark:text-white">선택한 날짜 일정</h3>

            {!selectedDate && (
              <p className="text-gray-500 text-sm">날짜를 선택하세요</p>
            )}

            <AnimatePresence>
              {selectedDate &&
                (eventsByDate[getDateKey(selectedDate)] || []).map(e => (
                  <motion.div
                    key={e._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-4 rounded-xl border backdrop-blur-sm"
                  >
                    <div className="flex justify-between">
                      <div>
                        <strong>{e.title}</strong>
                        {e.date && (
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {new Date(e.date).toLocaleString()}
                          </div>
                        )}
                        {e.category && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {e.category}
                          </div>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteSchedule(e._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </Card>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle>새 일정 추가</DialogTitle>
          </DialogHeader>

          <form onSubmit={createSchedule} className="space-y-4">
            <div>
              <Label>제목</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>날짜</Label>
              <Input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label>카테고리</Label>
              <Input
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </div>

            {err && <p className="text-red-500 text-sm">{err}</p>}

            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenCreate(false)}
              >
                취소
              </Button>
              <Button type="submit">추가</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
