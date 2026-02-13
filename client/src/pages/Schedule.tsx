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
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

import { motion, AnimatePresence } from "motion/react";
import { TechBackground } from "../components/TechBackground";

const DEFAULT_CATEGORIES = ["회의", "개발", "개인"];
const PRESET_PALETTES = [
  { label: "Sunset", colors: ["#F59E0B", "#F97316", "#EF4444"] },
  { label: "Ocean", colors: ["#06B6D4", "#3B82F6", "#6366F1"] },
  { label: "Forest", colors: ["#22C55E", "#16A34A", "#84CC16"] },
  { label: "Candy", colors: ["#EC4899", "#A855F7", "#F43F5E"] },
];

type Schedule = {
  _id: string;
  title: string;
  date?: string;
  category?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  memo?: string;
};

export function Schedule() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [memo, setMemo] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(
    {}
  );
  const [paletteName, setPaletteName] = useState("");
  const [savedPalettes, setSavedPalettes] = useState<
    { name: string; colors: string[]; favorite?: boolean; createdAt?: number }[]
  >([]);
  const [paletteEditing, setPaletteEditing] = useState<string | null>(null);
  const [paletteEditName, setPaletteEditName] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366F1");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [palettePulse, setPalettePulse] = useState(false);
  const [dragPaletteName, setDragPaletteName] = useState<string | null>(null);
  const defaultCategories = DEFAULT_CATEGORIES;
  const presetPalettes = PRESET_PALETTES;

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

  useEffect(() => {
    const saved = localStorage.getItem("scheduleCategoryColors");
    if (saved) {
      try {
        setCategoryColors(JSON.parse(saved));
      } catch {
        setCategoryColors({});
      }
    }
    const savedPalettesRaw = localStorage.getItem("scheduleSavedPalettes");
    if (savedPalettesRaw) {
      try {
        const parsed = JSON.parse(savedPalettesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === "string") {
            setSavedPalettes([
              {
                name: "내 팔레트",
                colors: parsed,
                favorite: false,
                createdAt: Date.now(),
              },
            ]);
          } else {
            const normalized = parsed
              .filter(
                (p: any) =>
                  p &&
                  typeof p.name === "string" &&
                  Array.isArray(p.colors)
              )
              .map((p: any) => ({
                name: p.name,
                colors: p.colors,
                favorite: !!p.favorite,
                createdAt: p.createdAt ?? Date.now(),
              }));
            setSavedPalettes(normalized);
          }
        } else {
          setSavedPalettes([]);
        }
      } catch {
        setSavedPalettes([]);
      }
    }
    const legacySingle = localStorage.getItem("scheduleSavedPalette");
    if (legacySingle && !savedPalettesRaw) {
      try {
        const parsed = JSON.parse(legacySingle);
        if (Array.isArray(parsed)) {
          setSavedPalettes([
            {
              name: "내 팔레트",
              colors: parsed,
              favorite: false,
              createdAt: Date.now(),
            },
          ]);
        }
      } catch {
        // ignore legacy
      }
    }
    const savedCustomRaw = localStorage.getItem("scheduleCustomCategories");
    if (savedCustomRaw) {
      try {
        setCustomCategories(JSON.parse(savedCustomRaw));
      } catch {
        setCustomCategories([]);
      }
    }
    const savedHiddenRaw = localStorage.getItem("scheduleHiddenCategories");
    if (savedHiddenRaw) {
      try {
        setHiddenCategories(JSON.parse(savedHiddenRaw));
      } catch {
        setHiddenCategories([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "scheduleCategoryColors",
      JSON.stringify(categoryColors)
    );
  }, [categoryColors]);

  useEffect(() => {
    const keys = Object.keys(categoryColors).filter(
      k => k && !defaultCategories.includes(k) && !hiddenCategories.includes(k)
    );
    if (keys.length === 0) return;
    setCustomCategories(prev =>
      Array.from(new Set([...prev, ...keys]))
    );
  }, [categoryColors, defaultCategories, hiddenCategories]);

  useEffect(() => {
    localStorage.setItem(
      "scheduleSavedPalettes",
      JSON.stringify(savedPalettes)
    );
  }, [savedPalettes]);

  useEffect(() => {
    localStorage.setItem(
      "scheduleCustomCategories",
      JSON.stringify(customCategories)
    );
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem(
      "scheduleHiddenCategories",
      JSON.stringify(hiddenCategories)
    );
  }, [hiddenCategories]);

  useEffect(() => {
    const fromItems = Array.from(
      new Set(
        items
          .map(i => i.category || "")
          .filter(c => c && !defaultCategories.includes(c))
      )
    );
    if (fromItems.length === 0) return;
    setCustomCategories(prev =>
      Array.from(
        new Set([...prev, ...fromItems.filter(c => !hiddenCategories.includes(c))])
      )
    );
  }, [items, defaultCategories, hiddenCategories]);

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const isoDate = date ? new Date(date).toISOString() : undefined;
      const res = await api.post("/api/schedules", {
        title,
        date: isoDate,
        category,
        memo: memo || undefined,
      });
      setItems(s => [res.data, ...s]);
      setTitle("");
      setDate("");
      setCategory("");
      setMemo("");
      if (category && !defaultCategories.includes(category)) {
        setCustomCategories(s =>
          s.includes(category) ? s : [...s, category]
        );
        setHiddenCategories(s => s.filter(c => c !== category));
      }
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

  const openEditDialog = (item: Schedule) => {
    setEditId(item._id);
    setEditTitle(item.title);
    setEditDate(item.date ? item.date.slice(0, 16) : "");
    setEditCategory(item.category ?? "");
    setEditMemo(item.memo ?? "");
    setOpenEdit(true);
  };

  const updateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setErr("");
    try {
      const isoDate = editDate ? new Date(editDate).toISOString() : undefined;
      const res = await api.put(`/api/schedules/${editId}`, {
        title: editTitle,
        date: isoDate,
        category: editCategory,
        memo: editMemo || undefined,
      });
      setItems(s => s.map(i => (i._id === editId ? res.data : i)));
      setOpenEdit(false);
      if (editCategory && !defaultCategories.includes(editCategory)) {
        setCustomCategories(s =>
          s.includes(editCategory) ? s : [...s, editCategory]
        );
        setHiddenCategories(s => s.filter(c => c !== editCategory));
      }
    } catch (error: unknown) {
      setErr(getErrorMessage(error) || "일정 수정 실패");
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


  const allCategories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      const c = i.category || "기타";
      if (!hiddenCategories.includes(c)) set.add(c);
    });
    defaultCategories.forEach(c => set.add(c));
    customCategories.forEach(c => {
      if (!hiddenCategories.includes(c)) set.add(c);
    });
    Object.keys(categoryColors).forEach(k => {
      if (!hiddenCategories.includes(k)) set.add(k);
    });
    return Array.from(set).sort();
  }, [items, categoryColors, defaultCategories, customCategories, hiddenCategories]);

  const visibleCategories = useMemo(() => {
    const q = categoryFilter.trim().toLowerCase();
    if (!q) return allCategories;
    return allCategories.filter(c => c.toLowerCase().includes(q));
  }, [allCategories, categoryFilter]);

  const sortedPalettes = useMemo(() => {
    const fav = savedPalettes.filter(p => p.favorite);
    const rest = savedPalettes.filter(p => !p.favorite);
    return [...fav, ...rest];
  }, [savedPalettes]);

  const palette = [
    "#6366F1",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#8B5CF6",
    "#14B8A6",
  ];

  const colorForCategory = (category?: string) => {
    const key = (category || "기타").trim();
    if (categoryColors[key]) return categoryColors[key];
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = (hash * 31 + key.charCodeAt(i)) % palette.length;
    }
    return palette[hash];
  };

  const renderHighlighted = (name: string) => {
    const q = categoryFilter.trim();
    if (!q) return name;
    const idx = name.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return name;
    return (
      <>
        {name.slice(0, idx)}
        <span className="bg-amber-200/80 dark:bg-amber-400/30 rounded px-0.5">
          {name.slice(idx, idx + q.length)}
        </span>
        {name.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      <TechBackground />
      <style>
        {`
          @keyframes paletteGlow {
            0% { box-shadow: 0 0 0 rgba(99,102,241,0.0); transform: translateY(0); }
            50% { box-shadow: 0 0 25px rgba(99,102,241,0.45); transform: translateY(-2px); }
            100% { box-shadow: 0 0 0 rgba(99,102,241,0.0); transform: translateY(0); }
          }
        `}
      </style>

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
          <Card className="lg:col-span-2 p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl border border-white/60 dark:border-slate-700/60">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-slate-800 dark:text-white font-semibold">
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
                <div
                  key={d}
                  className="text-center text-slate-500 dark:text-slate-400 text-sm"
                >
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
                const uniqueCategories = Array.from(
                  new Set(dayEvents.map(e => e.category || "기타"))
                );
                const isSelected =
                  selectedDate?.toDateString() === dateObj.toDateString();
                const isToday =
                  new Date().toDateString() === dateObj.toDateString();

                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDate(dateObj)}
                    whileHover={{ scale: 1.1 }}
                    className={`aspect-square rounded-xl p-2 relative transition text-slate-800 dark:text-slate-100 ${
                      isSelected
                        ? "bg-indigo-500/20 ring-2 ring-indigo-500 shadow-lg"
                        : "bg-white/40 hover:bg-white/70 dark:bg-slate-800/60 dark:hover:bg-slate-700/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{day}</span>
                      {isToday && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500 text-white">
                          오늘
                        </span>
                      )}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                        {uniqueCategories.slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="h-1.5 w-5 rounded-full"
                            style={{ backgroundColor: colorForCategory(cat) }}
                          />
                        ))}
                        {uniqueCategories.length > 2 && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            +{uniqueCategories.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {/* Selected Day */}
          <Card className="p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl border border-white/60 dark:border-slate-700/60">
            <h3 className="mb-4 text-slate-800 dark:text-white font-semibold">
              선택한 날짜 일정
            </h3>

            {!selectedDate && (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                날짜를 선택하세요
              </p>
            )}

            <AnimatePresence>
            {selectedDate &&
              (eventsByDate[getDateKey(selectedDate)] || []).length === 0 && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  선택한 날짜에 일정이 없습니다.
                </div>
              )}
            {selectedDate &&
              (eventsByDate[getDateKey(selectedDate)] || []).map(e => (
                <motion.div
                  key={e._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/70 backdrop-blur-sm cursor-pointer hover:shadow-md transition"
                  onClick={() => openEditDialog(e)}
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
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                            style={{
                              backgroundColor: `${colorForCategory(
                                e.category
                              )}22`,
                              color: colorForCategory(e.category),
                            }}
                          >
                            <Tag className="h-3 w-3" />
                            {e.category || "기타"}
                          </span>
                          {(e.createdAt || e.updatedAt) && (
                            <span className="text-xs text-gray-400 flex flex-col">
                              {e.createdAt && (
                                <span>
                                  작성: {new Date(e.createdAt).toLocaleString()}
                                </span>
                              )}
                              {e.updatedAt && (
                                <span>
                                  수정: {new Date(e.updatedAt).toLocaleString()}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                        {e.memo && (
                          <div className="text-sm text-slate-600 mt-2">
                            메모: {e.memo}
                          </div>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={evt => {
                          evt.stopPropagation();
                          deleteSchedule(e._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            <div className="mt-6 border-t border-slate-200/60 dark:border-slate-700/60 pt-4 text-xs text-slate-500 dark:text-slate-400">
              카테고리 색상 설정은 “새 일정” 또는 “일정 수정” 팝업에서
              가능합니다.
            </div>
          </Card>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void createSchedule(e as any);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>새 일정 추가</DialogTitle>
          </DialogHeader>

          <form onSubmit={createSchedule} className="space-y-4">
            <div className="text-xs text-slate-500">
              작성일: {new Date().toLocaleString()}
            </div>
            <div>
              <Label>제목</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <Label>날짜</Label>
              <Input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <Label>카테고리</Label>
              <Input
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 p-4 space-y-4 bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-slate-900/70 dark:to-slate-950/60 shadow-inner">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                카테고리 색상
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="팔레트 이름"
                    value={paletteName}
                    onChange={e => setPaletteName(e.target.value)}
                    className="h-9 w-40"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const name = paletteName.trim();
                      if (!name) return;
                      const colors = allCategories.map(cat =>
                        colorForCategory(cat)
                      );
                      setSavedPalettes(s => [
                        ...s.filter(p => p.name !== name),
                        { name, colors, favorite: false, createdAt: Date.now() },
                      ]);
                      setPaletteName("");
                    }}
                  >
                    팔레트 저장
                  </Button>
                </div>

                {sortedPalettes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sortedPalettes.map(p => (
                      <div
                        key={p.name}
                        className="flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs"
                        draggable
                        onDragStart={() => setDragPaletteName(p.name)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => {
                          if (!dragPaletteName || dragPaletteName === p.name)
                            return;
                          setSavedPalettes(s => {
                            const list = [...s];
                            const from = list.findIndex(
                              sp => sp.name === dragPaletteName
                            );
                            const to = list.findIndex(sp => sp.name === p.name);
                            if (from === -1 || to === -1) return s;
                            const [moved] = list.splice(from, 1);
                            list.splice(to, 0, moved);
                            return list;
                          });
                        }}
                      >
                        <button
                          type="button"
                          className={`mr-1 ${p.favorite ? "text-amber-500" : "text-slate-400"}`}
                          title="즐겨찾기"
                          onClick={() =>
                            setSavedPalettes(s =>
                              s.map(sp =>
                                sp.name === p.name
                                  ? { ...sp, favorite: !sp.favorite }
                                  : sp
                              )
                            )
                          }
                        >
                          ★
                        </button>
                        {paletteEditing === p.name ? (
                          <input
                            className="bg-transparent outline-none w-20"
                            value={paletteEditName}
                            onChange={e => setPaletteEditName(e.target.value)}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...categoryColors };
                              allCategories.forEach((cat, idx) => {
                                next[cat] = p.colors[idx % p.colors.length];
                              });
                              setCategoryColors(next);
                              setPalettePulse(true);
                              window.setTimeout(() => setPalettePulse(false), 600);
                            }}
                          >
                            {p.name}
                          </button>
                        )}
                        {paletteEditing === p.name ? (
                          <button
                            type="button"
                            className="text-slate-500 hover:text-slate-700"
                            onClick={() => {
                              const name = paletteEditName.trim();
                              if (!name) return;
                              setSavedPalettes(s =>
                                s.map(sp =>
                                  sp.name === p.name
                                    ? { ...sp, name }
                                    : sp
                                )
                              );
                              setPaletteEditing(null);
                              setPaletteEditName("");
                            }}
                          >
                            저장
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600"
                            onClick={() => {
                              setPaletteEditing(p.name);
                              setPaletteEditName(p.name);
                            }}
                          >
                            편집
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setSavedPalettes(s =>
                              s.filter(sp => sp.name !== p.name)
                            )
                          }
                          className="text-slate-400 hover:text-slate-600"
                          title="삭제"
                        >
                          ✕
                        </button>
                        <span className="inline-flex items-center gap-1">
                          {p.colors.slice(0, 3).map(c => (
                            <span
                              key={c}
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {presetPalettes.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      className="px-2.5 py-1 rounded-full text-xs border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70"
                      onClick={() => {
                        const next = { ...categoryColors };
                        allCategories.forEach((cat, idx) => {
                          next[cat] = p.colors[idx % p.colors.length];
                        });
                        setCategoryColors(next);
                        setPalettePulse(true);
                        window.setTimeout(() => setPalettePulse(false), 600);
                      }}
                    >
                      <span className="mr-2">{p.label}</span>
                      <span className="inline-flex items-center gap-1">
                        {p.colors.map(c => (
                          <span
                            key={c}
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {allCategories.length === 0 && (
                  <div className="text-xs text-slate-500">
                    아직 카테고리가 없습니다.
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <Input
                    placeholder="카테고리 검색"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="h-8 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  />
                  <button
                    type="button"
                    className="text-xs text-slate-500"
                    onClick={() => setCategoryFilter("")}
                  >
                    초기화
                  </button>
                </div>
                <div
                  className={`grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 ${
                    palettePulse ? "animate-[paletteGlow_0.7s_ease-in-out_1] ring-2 ring-indigo-300/50 rounded-xl p-1" : ""
                  }`}
                >
                  {visibleCategories.map(cat => {
                    const isDefault = defaultCategories.includes(cat);
                    const isCustom = !isDefault;
                    const hasOverride = !!categoryColors[cat];
                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 px-2 py-2"
                      >
                        <span
                          className="inline-flex items-center gap-2 text-xs"
                          style={{ color: colorForCategory(cat) }}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: colorForCategory(cat) }}
                          />
                          {renderHighlighted(cat)}
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={colorForCategory(cat)}
                            onChange={e =>
                              setCategoryColors(s => ({
                                ...s,
                                [cat]: e.target.value,
                              }))
                            }
                            className="h-7 w-9 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
                          />
                          {isDefault ? (
                            hasOverride && (
                              <button
                                type="button"
                                className="text-xs text-slate-500"
                                onClick={() =>
                                  setCategoryColors(s => {
                                    const next = { ...s };
                                    delete next[cat];
                                    return next;
                                  })
                                }
                              >
                                ↺
                              </button>
                            )
                          ) : isCustom ? (
                            <button
                              type="button"
                              className="text-xs text-slate-500"
                              onClick={e => {
                                e.preventDefault();
                                setCategoryColors(s => {
                                  const next = { ...s };
                                  delete next[cat];
                                  return next;
                                });
                                setCustomCategories(s =>
                                  s.filter(c => c !== cat)
                                );
                                setHiddenCategories(s =>
                                  s.includes(cat) ? s : [...s, cat]
                                );
                              }}
                            >
                              ✕
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="새 카테고리"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={e => setNewCategoryColor(e.target.value)}
                  className="h-9 w-12 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const name = newCategoryName.trim();
                    if (!name) return;
                    setCategoryColors(s => ({ ...s, [name]: newCategoryColor }));
                    setCustomCategories(s =>
                      s.includes(name) ? s : [...s, name]
                    );
                    setHiddenCategories(s => s.filter(c => c !== name));
                    setNewCategoryName("");
                  }}
                >
                  추가
                </Button>
              </div>
            </div>
            <div>
              <Label>메모</Label>
              <Textarea
                rows={3}
                value={memo}
                onChange={e => setMemo(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
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
            <div className="text-xs text-slate-500">
              단축키: ⌘/Ctrl+Enter 추가
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void updateSchedule(e as any);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>일정 수정</DialogTitle>
          </DialogHeader>

          <form onSubmit={updateSchedule} className="space-y-4">
            <div>
              <Label>제목</Label>
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <Label>날짜</Label>
              <Input
                type="datetime-local"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <Label>카테고리</Label>
              <Input
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 p-4 space-y-4 bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-slate-900/70 dark:to-slate-950/60 shadow-inner">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                카테고리 색상
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="팔레트 이름"
                    value={paletteName}
                    onChange={e => setPaletteName(e.target.value)}
                    className="h-9 w-40"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const name = paletteName.trim();
                      if (!name) return;
                      const colors = allCategories.map(cat =>
                        colorForCategory(cat)
                      );
                      setSavedPalettes(s => [
                        ...s.filter(p => p.name !== name),
                        { name, colors, favorite: false, createdAt: Date.now() },
                      ]);
                      setPaletteName("");
                    }}
                  >
                    팔레트 저장
                  </Button>
                </div>

                {sortedPalettes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sortedPalettes.map(p => (
                      <div
                        key={p.name}
                        className="flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs"
                        draggable
                        onDragStart={() => setDragPaletteName(p.name)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => {
                          if (!dragPaletteName || dragPaletteName === p.name)
                            return;
                          setSavedPalettes(s => {
                            const list = [...s];
                            const from = list.findIndex(
                              sp => sp.name === dragPaletteName
                            );
                            const to = list.findIndex(sp => sp.name === p.name);
                            if (from === -1 || to === -1) return s;
                            const [moved] = list.splice(from, 1);
                            list.splice(to, 0, moved);
                            return list;
                          });
                        }}
                      >
                        <button
                          type="button"
                          className={`mr-1 ${p.favorite ? "text-amber-500" : "text-slate-400"}`}
                          title="즐겨찾기"
                          onClick={() =>
                            setSavedPalettes(s =>
                              s.map(sp =>
                                sp.name === p.name
                                  ? { ...sp, favorite: !sp.favorite }
                                  : sp
                              )
                            )
                          }
                        >
                          ★
                        </button>
                        {paletteEditing === p.name ? (
                          <input
                            className="bg-transparent outline-none w-20"
                            value={paletteEditName}
                            onChange={e => setPaletteEditName(e.target.value)}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...categoryColors };
                              allCategories.forEach((cat, idx) => {
                                next[cat] = p.colors[idx % p.colors.length];
                              });
                              setCategoryColors(next);
                              setPalettePulse(true);
                              window.setTimeout(() => setPalettePulse(false), 600);
                            }}
                          >
                            {p.name}
                          </button>
                        )}
                        {paletteEditing === p.name ? (
                          <button
                            type="button"
                            className="text-slate-500 hover:text-slate-700"
                            onClick={() => {
                              const name = paletteEditName.trim();
                              if (!name) return;
                              setSavedPalettes(s =>
                                s.map(sp =>
                                  sp.name === p.name
                                    ? { ...sp, name }
                                    : sp
                                )
                              );
                              setPaletteEditing(null);
                              setPaletteEditName("");
                            }}
                          >
                            저장
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600"
                            onClick={() => {
                              setPaletteEditing(p.name);
                              setPaletteEditName(p.name);
                            }}
                          >
                            편집
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setSavedPalettes(s =>
                              s.filter(sp => sp.name !== p.name)
                            )
                          }
                          className="text-slate-400 hover:text-slate-600"
                          title="삭제"
                        >
                          ✕
                        </button>
                        <span className="inline-flex items-center gap-1">
                          {p.colors.slice(0, 3).map(c => (
                            <span
                              key={c}
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {presetPalettes.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      className="px-2.5 py-1 rounded-full text-xs border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70"
                      onClick={() => {
                        const next = { ...categoryColors };
                        allCategories.forEach((cat, idx) => {
                          next[cat] = p.colors[idx % p.colors.length];
                        });
                        setCategoryColors(next);
                      }}
                    >
                      <span className="mr-2">{p.label}</span>
                      <span className="inline-flex items-center gap-1">
                        {p.colors.map(c => (
                          <span
                            key={c}
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {allCategories.length === 0 && (
                  <div className="text-xs text-slate-500">
                    아직 카테고리가 없습니다.
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <Input
                    placeholder="카테고리 검색"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="h-8 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  />
                  <button
                    type="button"
                    className="text-xs text-slate-500"
                    onClick={() => setCategoryFilter("")}
                  >
                    초기화
                  </button>
                </div>
                <div
                  className={`grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 ${
                    palettePulse ? "animate-[paletteGlow_0.7s_ease-in-out_1] ring-2 ring-indigo-300/50 rounded-xl p-1" : ""
                  }`}
                >
                  {visibleCategories.map(cat => {
                    const isDefault = defaultCategories.includes(cat);
                    const isCustom = !isDefault;
                    const hasOverride = !!categoryColors[cat];
                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 px-2 py-2"
                      >
                        <span
                          className="inline-flex items-center gap-2 text-xs"
                          style={{ color: colorForCategory(cat) }}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: colorForCategory(cat) }}
                          />
                          {renderHighlighted(cat)}
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={colorForCategory(cat)}
                            onChange={e =>
                              setCategoryColors(s => ({
                                ...s,
                                [cat]: e.target.value,
                              }))
                            }
                            className="h-7 w-9 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
                          />
                          {isDefault ? (
                            hasOverride && (
                              <button
                                type="button"
                                className="text-xs text-slate-500"
                                onClick={() =>
                                  setCategoryColors(s => {
                                    const next = { ...s };
                                    delete next[cat];
                                    return next;
                                  })
                                }
                              >
                                ↺
                              </button>
                            )
                          ) : isCustom ? (
                            <button
                              type="button"
                              className="text-xs text-slate-500"
                              onClick={e => {
                                e.preventDefault();
                                setCategoryColors(s => {
                                  const next = { ...s };
                                  delete next[cat];
                                  return next;
                                });
                                setCustomCategories(s =>
                                  s.filter(c => c !== cat)
                                );
                                setHiddenCategories(s =>
                                  s.includes(cat) ? s : [...s, cat]
                                );
                              }}
                            >
                              ✕
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="새 카테고리"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                />
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={e => setNewCategoryColor(e.target.value)}
                  className="h-9 w-12 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const name = newCategoryName.trim();
                    if (!name) return;
                    setCategoryColors(s => ({ ...s, [name]: newCategoryColor }));
                    setCustomCategories(s =>
                      s.includes(name) ? s : [...s, name]
                    );
                    setHiddenCategories(s => s.filter(c => c !== name));
                    setNewCategoryName("");
                  }}
                >
                  추가
                </Button>
              </div>
            </div>
            <div>
              <Label>메모</Label>
              <Textarea
                rows={3}
                value={editMemo}
                onChange={e => setEditMemo(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>

            {err && <p className="text-red-500 text-sm">{err}</p>}

            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenEdit(false)}
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
