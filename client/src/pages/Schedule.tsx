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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { CategoryColorPanel } from "../components/schedule/CategoryColorPanel";
import {
  toIsoStringOrUndefined,
  toLocalDateKey,
  toLocalDateTimeInputValue,
} from "../utils/dateTime";
import { getKoreanHolidayMap } from "../utils/krHolidays";

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
  startDate?: string;
  endDate?: string;
  category?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  memo?: string;
};

const getScheduleRange = (item: Schedule) => {
  const startBase = item.startDate || item.date;
  const endBase = item.endDate || item.startDate || item.date;
  if (!startBase || !endBase) return null;

  const startDate = new Date(startBase);
  const endDate = new Date(endBase);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const start = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );
  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  if (start.getTime() > end.getTime()) {
    return { start: end, end: start };
  }
  return { start, end };
};

const getSpanTypeByDate = (item: Schedule, targetDate: Date) => {
  const range = getScheduleRange(item);
  if (!range) return "single" as const;
  const startKey = toLocalDateKey(range.start);
  const endKey = toLocalDateKey(range.end);
  const targetKey = toLocalDateKey(targetDate);
  if (startKey === endKey) return "single" as const;
  if (targetKey === startKey) return "start" as const;
  if (targetKey === endKey) return "end" as const;
  return "middle" as const;
};

type SavedPalette = {
  name: string;
  colors: string[];
  favorite?: boolean;
  createdAt?: number;
};

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = hue / 60;
  const x = chroma * (1 - Math.abs((hPrime % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;

  if (hPrime >= 0 && hPrime < 1) {
    r = chroma;
    g = x;
  } else if (hPrime < 2) {
    r = x;
    g = chroma;
  } else if (hPrime < 3) {
    g = chroma;
    b = x;
  } else if (hPrime < 4) {
    g = x;
    b = chroma;
  } else if (hPrime < 5) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const m = l - chroma / 2;
  const toHex = (channel: number) =>
    Math.round((channel + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const generateDistinctHex = (index: number) =>
  hslToHex((index * 137.508) % 360, 72, 48);

const parseStoredCategoryColors = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem("scheduleCategoryColors");
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return Object.entries(parsed).reduce<Record<string, string>>(
      (acc, [k, v]) => {
        if (typeof k === "string" && typeof v === "string") {
          acc[k] = v;
        }
        return acc;
      },
      {},
    );
  } catch {
    return {};
  }
};

const parseStoredPalettes = (): SavedPalette[] => {
  if (typeof window === "undefined") return [];
  const savedPalettesRaw = localStorage.getItem("scheduleSavedPalettes");
  if (savedPalettesRaw) {
    try {
      const parsed = JSON.parse(savedPalettesRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === "string") {
          return [
            {
              name: "내 팔레트",
              colors: parsed,
              favorite: false,
              createdAt: Date.now(),
            },
          ];
        }
        return parsed
          .filter(
            (p: unknown) =>
              p &&
              typeof (p as Record<string, unknown>).name === "string" &&
              Array.isArray((p as Record<string, unknown>).colors),
          )
          .map((p: unknown) => {
            const item = p as Record<string, unknown>;
            return {
              name: item.name as string,
              colors: item.colors as string[],
              favorite: !!item.favorite,
              createdAt: (item.createdAt as number) ?? Date.now(),
            };
          });
      }
      return [];
    } catch {
      return [];
    }
  }

  const legacySingle = localStorage.getItem("scheduleSavedPalette");
  if (!legacySingle) return [];
  try {
    const parsed = JSON.parse(legacySingle);
    if (!Array.isArray(parsed)) return [];
    return [
      {
        name: "내 팔레트",
        colors: parsed,
        favorite: false,
        createdAt: Date.now(),
      },
    ];
  } catch {
    return [];
  }
};

const parseStoredStringArray = (key: string): string[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(v => typeof v === "string");
  } catch {
    return [];
  }
};

export function Schedule() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [rangeStartDate, setRangeStartDate] = useState("");
  const [rangeEndDate, setRangeEndDate] = useState("");
  const [createMode, setCreateMode] = useState<"single" | "range">("single");
  const [category, setCategory] = useState("");
  const [memo, setMemo] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editRangeStartDate, setEditRangeStartDate] = useState("");
  const [editRangeEndDate, setEditRangeEndDate] = useState("");
  const [editMode, setEditMode] = useState<"single" | "range">("single");
  const [editCategory, setEditCategory] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(
    parseStoredCategoryColors,
  );
  const [paletteName, setPaletteName] = useState("");
  const [savedPalettes, setSavedPalettes] =
    useState<SavedPalette[]>(parseStoredPalettes);
  const [paletteEditing, setPaletteEditing] = useState<string | null>(null);
  const [paletteEditName, setPaletteEditName] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>(() =>
    parseStoredStringArray("scheduleCustomCategories"),
  );
  const [hiddenCategories, setHiddenCategories] = useState<string[]>(() =>
    parseStoredStringArray("scheduleHiddenCategories"),
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366F1");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [palettePulse, setPalettePulse] = useState(false);
  const [dragPaletteName, setDragPaletteName] = useState<string | null>(null);
  const [showCreateCategoryPanel, setShowCreateCategoryPanel] = useState(true);
  const [showEditCategoryPanel, setShowEditCategoryPanel] = useState(true);
  const [selectedDayQuery, setSelectedDayQuery] = useState("");
  const [selectedDayCategory, setSelectedDayCategory] = useState("all");
  const [selectedDayExpanded, setSelectedDayExpanded] = useState(false);
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
    setSelectedDayExpanded(false);
    setSelectedDayQuery("");
    setSelectedDayCategory("all");
  }, [selectedDate?.toDateString()]);

  useEffect(() => {
    localStorage.setItem(
      "scheduleCategoryColors",
      JSON.stringify(categoryColors),
    );
  }, [categoryColors]);

  useEffect(() => {
    const keys = Object.keys(categoryColors).filter(
      k => k && !defaultCategories.includes(k) && !hiddenCategories.includes(k),
    );
    if (keys.length === 0) return;
    setCustomCategories(prev => Array.from(new Set([...prev, ...keys])));
  }, [categoryColors, defaultCategories, hiddenCategories]);

  useEffect(() => {
    localStorage.setItem(
      "scheduleSavedPalettes",
      JSON.stringify(savedPalettes),
    );
  }, [savedPalettes]);

  useEffect(() => {
    localStorage.setItem(
      "scheduleCustomCategories",
      JSON.stringify(customCategories),
    );
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem(
      "scheduleHiddenCategories",
      JSON.stringify(hiddenCategories),
    );
  }, [hiddenCategories]);

  useEffect(() => {
    const fromItems = Array.from(
      new Set(
        items
          .map(i => i.category || "")
          .filter(c => c && !defaultCategories.includes(c)),
      ),
    );
    if (fromItems.length === 0) return;
    setCustomCategories(prev =>
      Array.from(
        new Set([
          ...prev,
          ...fromItems.filter(c => !hiddenCategories.includes(c)),
        ]),
      ),
    );
  }, [items, defaultCategories, hiddenCategories]);

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const isoDate = toIsoStringOrUndefined(date);
      const isoStartDate = toIsoStringOrUndefined(rangeStartDate);
      const isoEndDate = toIsoStringOrUndefined(rangeEndDate);
      if (createMode === "single" && !isoDate) {
        setErr("일정을 위한 날짜를 입력해 주세요.");
        return;
      }
      if (createMode === "range" && (!isoStartDate || !isoEndDate)) {
        setErr("기간 일정은 시작일과 마감일이 모두 필요합니다.");
        return;
      }
      if (
        createMode === "range" &&
        isoStartDate &&
        isoEndDate &&
        new Date(isoStartDate).getTime() > new Date(isoEndDate).getTime()
      ) {
        setErr("마감일은 시작일 이후여야 합니다.");
        return;
      }
      const res = await api.post("/api/schedules", {
        title,
        date: createMode === "single" ? isoDate : isoStartDate || isoDate,
        startDate: createMode === "range" ? isoStartDate : undefined,
        endDate: createMode === "range" ? isoEndDate : undefined,
        category,
        memo: memo || undefined,
      });
      setItems(s => [res.data, ...s]);
      setTitle("");
      setDate("");
      setRangeStartDate("");
      setRangeEndDate("");
      setCreateMode("single");
      setCategory("");
      setMemo("");
      if (category && !defaultCategories.includes(category)) {
        setCustomCategories(s => (s.includes(category) ? s : [...s, category]));
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
    const startDate = item.startDate || item.date;
    const endDate = item.endDate || item.date;
    const hasRange = !!item.startDate || !!item.endDate;
    setEditId(item._id);
    setEditTitle(item.title);
    setEditDate(toLocalDateTimeInputValue(item.date));
    setEditRangeStartDate(toLocalDateTimeInputValue(startDate));
    setEditRangeEndDate(toLocalDateTimeInputValue(endDate));
    setEditMode(hasRange ? "range" : "single");
    setEditCategory(item.category ?? "");
    setEditMemo(item.memo ?? "");
    setShowEditCategoryPanel(true);
    setOpenEdit(true);
  };

  const updateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setErr("");
    try {
      const isoDate = toIsoStringOrUndefined(editDate);
      const isoStartDate = toIsoStringOrUndefined(editRangeStartDate);
      const isoEndDate = toIsoStringOrUndefined(editRangeEndDate);
      if (editMode === "single" && !isoDate) {
        setErr("일정을 위한 날짜를 입력해 주세요.");
        return;
      }
      if (editMode === "range" && (!isoStartDate || !isoEndDate)) {
        setErr("기간 일정은 시작일과 마감일이 모두 필요합니다.");
        return;
      }
      if (
        editMode === "range" &&
        isoStartDate &&
        isoEndDate &&
        new Date(isoStartDate).getTime() > new Date(isoEndDate).getTime()
      ) {
        setErr("마감일은 시작일 이후여야 합니다.");
        return;
      }
      const res = await api.put(`/api/schedules/${editId}`, {
        title: editTitle,
        date: editMode === "single" ? isoDate : isoStartDate || isoDate,
        startDate: editMode === "range" ? isoStartDate : undefined,
        endDate: editMode === "range" ? isoEndDate : undefined,
        category: editCategory,
        memo: editMemo || undefined,
      });
      setItems(s => s.map(i => (i._id === editId ? res.data : i)));
      setOpenEdit(false);
      if (editCategory && !defaultCategories.includes(editCategory)) {
        setCustomCategories(s =>
          s.includes(editCategory) ? s : [...s, editCategory],
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
  const holidayMap = useMemo(() => getKoreanHolidayMap(year), [year]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    items.forEach(item => {
      const range = getScheduleRange(item);
      if (!range) return;

      const cursor = new Date(range.start);
      while (cursor.getTime() <= range.end.getTime()) {
        const key = toLocalDateKey(cursor);
        map[key] = map[key] || [];
        map[key].push(item);
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return map;
  }, [items]);

  const getDateKey = (d: Date) => toLocalDateKey(d);

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
  }, [
    items,
    categoryColors,
    defaultCategories,
    customCategories,
    hiddenCategories,
  ]);

  const uniqueCategoryColors = useMemo(() => {
    const resolved: Record<string, string> = {};
    const used = new Set<string>();
    let colorIndex = 0;

    allCategories.forEach(categoryName => {
      const preferred = categoryColors[categoryName];
      if (preferred) {
        const normalized = preferred.toUpperCase();
        if (!used.has(normalized)) {
          resolved[categoryName] = normalized;
          used.add(normalized);
          return;
        }
      }

      let nextColor = "";
      while (!nextColor || used.has(nextColor)) {
        nextColor = generateDistinctHex(colorIndex);
        colorIndex += 1;
      }
      resolved[categoryName] = nextColor;
      used.add(nextColor);
    });

    return resolved;
  }, [allCategories, categoryColors]);

  useEffect(() => {
    if (allCategories.length === 0) return;
    let changed = false;
    const next = { ...categoryColors };
    allCategories.forEach(categoryName => {
      const color = uniqueCategoryColors[categoryName];
      if (next[categoryName] !== color) {
        next[categoryName] = color;
        changed = true;
      }
    });
    if (changed) setCategoryColors(next);
  }, [allCategories, categoryColors, uniqueCategoryColors]);

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

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate[getDateKey(selectedDate)] || [];
  }, [eventsByDate, selectedDate]);

  const selectedDayCategories = useMemo(
    () => Array.from(new Set(selectedDayEvents.map(e => e.category || "기타"))),
    [selectedDayEvents],
  );

  const selectedDayFilteredEvents = useMemo(() => {
    const q = selectedDayQuery.trim().toLowerCase();
    return selectedDayEvents
      .filter(e => {
        const categoryName = e.category || "기타";
        if (selectedDayCategory !== "all" && categoryName !== selectedDayCategory)
          return false;
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) || (e.memo || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aRange = getScheduleRange(a);
        const bRange = getScheduleRange(b);
        const aTime = aRange ? aRange.start.getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = bRange ? bRange.start.getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
  }, [selectedDayCategory, selectedDayEvents, selectedDayQuery]);

  const selectedDayVisibleEvents = useMemo(
    () =>
      selectedDayExpanded
        ? selectedDayFilteredEvents
        : selectedDayFilteredEvents.slice(0, 6),
    [selectedDayExpanded, selectedDayFilteredEvents],
  );

  const colorForCategory = (category?: string) => {
    const key = (category || "기타").trim();
    if (uniqueCategoryColors[key]) return uniqueCategoryColors[key];
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = (hash * 31 + key.charCodeAt(i)) % 360;
    }
    return hslToHex(hash, 72, 48);
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

  const applyPaletteColors = (colors: string[]) => {
    if (colors.length === 0) return;
    const next = { ...categoryColors };
    allCategories.forEach((cat, idx) => {
      next[cat] = colors[idx % colors.length];
    });
    setCategoryColors(next);
    setPalettePulse(true);
    window.setTimeout(() => setPalettePulse(false), 600);
  };

  const savePalette = () => {
    const name = paletteName.trim();
    if (!name) return;
    const colors = allCategories.map(cat => colorForCategory(cat));
    setSavedPalettes(s => [
      ...s.filter(p => p.name !== name),
      { name, colors, favorite: false, createdAt: Date.now() },
    ]);
    setPaletteName("");
  };

  const reorderPalette = (targetName: string) => {
    if (!dragPaletteName || dragPaletteName === targetName) return;
    setSavedPalettes(s => {
      const list = [...s];
      const from = list.findIndex(sp => sp.name === dragPaletteName);
      const to = list.findIndex(sp => sp.name === targetName);
      if (from === -1 || to === -1) return s;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return list;
    });
  };

  const toggleFavoritePalette = (name: string) => {
    setSavedPalettes(s =>
      s.map(sp => (sp.name === name ? { ...sp, favorite: !sp.favorite } : sp)),
    );
  };

  const savePaletteName = (originalName: string) => {
    const name = paletteEditName.trim();
    if (!name) return;
    setSavedPalettes(s =>
      s.map(sp => (sp.name === originalName ? { ...sp, name } : sp)),
    );
    setPaletteEditing(null);
    setPaletteEditName("");
  };

  const removeCustomCategory = (cat: string) => {
    setCategoryColors(s => {
      const next = { ...s };
      delete next[cat];
      return next;
    });
    setCustomCategories(s => s.filter(c => c !== cat));
    setHiddenCategories(s => (s.includes(cat) ? s : [...s, cat]));
  };

  const addCustomCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCategoryColors(s => ({ ...s, [name]: newCategoryColor }));
    setCustomCategories(s => (s.includes(name) ? s : [...s, name]));
    setHiddenCategories(s => s.filter(c => c !== name));
    setNewCategoryName("");
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                일정 관리
              </h1>
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
              onClick={() => {
                const selectedBase = selectedDate
                  ? `${toLocalDateKey(selectedDate)}T09:00`
                  : "";
                setCreateMode("single");
                setDate(selectedBase);
                setRangeStartDate(selectedBase);
                setRangeEndDate(selectedBase);
                setShowCreateCategoryPanel(true);
                setOpenCreate(true);
              }}
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
                  new Set(dayEvents.map(e => e.category || "기타")),
                );
                const continuedCount = dayEvents.filter(event => {
                  const range = getScheduleRange(event);
                  if (!range) return false;
                  return toLocalDateKey(range.start) !== toLocalDateKey(range.end);
                }).length;
                const hasContinuedEvents = continuedCount > 0;
                const isSelected =
                  selectedDate?.toDateString() === dateObj.toDateString();
                const isToday =
                  new Date().toDateString() === dateObj.toDateString();
                const isSunday = dateObj.getDay() === 0;
                const holidayName = holidayMap[key];
                const isHoliday = Boolean(holidayName);

                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDate(dateObj)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: day * 0.01 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.96 }}
                    className={`aspect-square rounded-xl p-2 relative border transition-all duration-200 text-slate-800 dark:text-slate-100 ${
                      isSelected
                        ? "bg-indigo-500/20 border-indigo-300 ring-2 ring-indigo-500 shadow-lg"
                        : "bg-white/60 border-slate-200/80 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md dark:bg-slate-800/60 dark:border-slate-700 dark:hover:bg-slate-700/70 dark:hover:border-indigo-500/60"
                    } ${isToday && !isSelected ? "ring-1 ring-indigo-200/80 dark:ring-indigo-700/70" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-semibold ${
                          isHoliday || isSunday
                            ? "text-rose-600 dark:text-rose-400"
                            : ""
                        }`}
                      >
                        {day}
                      </span>
                      {isToday && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500 text-white">
                          오늘
                        </span>
                      )}
                    </div>
                    {hasContinuedEvents && (
                      <>
                        <div className="absolute top-0 left-2 right-2 h-1 rounded-b-full bg-gradient-to-r from-indigo-500/80 to-cyan-400/80" />
                        <div className="mt-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-300 truncate text-left">
                          이어진 일정 {continuedCount > 1 ? `${continuedCount}개` : ""}
                        </div>
                      </>
                    )}
                    {holidayName && (
                      <div className="mt-1 text-[10px] font-medium text-rose-600 dark:text-rose-400 truncate text-left">
                        {holidayName}
                      </div>
                    )}
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
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-slate-800 dark:text-white font-semibold">
                선택한 날짜 일정
              </h3>
              {selectedDate && (
                <span className="text-xs rounded-full px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {selectedDayEvents.length}개
                </span>
              )}
            </div>

            {!selectedDate && (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                날짜를 선택하세요
              </p>
            )}

            {selectedDate && (
              <div className="mb-3 space-y-2">
                <Input
                  value={selectedDayQuery}
                  onChange={e => setSelectedDayQuery(e.target.value)}
                  placeholder="제목/메모 검색"
                  className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600"
                />
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedDayCategory}
                    onValueChange={setSelectedDayCategory}
                  >
                    <SelectTrigger className="bg-white/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-600">
                      <SelectValue placeholder="카테고리" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 카테고리</SelectItem>
                      {selectedDayCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDayQuery("");
                      setSelectedDayCategory("all");
                    }}
                  >
                    초기화
                  </Button>
                </div>
              </div>
            )}

            <AnimatePresence>
              {selectedDate &&
                selectedDayFilteredEvents.length === 0 && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    선택한 날짜에 일정이 없습니다.
                  </div>
                )}
              {selectedDate &&
                selectedDayVisibleEvents.length > 0 && (
                  <div className="max-h-[430px] overflow-y-auto pr-1">
                    {selectedDayVisibleEvents.map(e => (
                  <motion.div
                    key={e._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.16 }}
                    className="mb-3 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/70 backdrop-blur-sm cursor-pointer hover:shadow-md hover:border-indigo-300/70 dark:hover:border-indigo-500/60 transition"
                    onClick={() => openEditDialog(e)}
                  >
                    <div className="flex justify-between">
                      <div>
                        {selectedDate && (() => {
                          const spanType = getSpanTypeByDate(e, selectedDate);
                          if (spanType === "single") return null;
                          return (
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                이어진 일정
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                                {spanType === "start"
                                  ? "시작일"
                                  : spanType === "end"
                                    ? "마감일"
                                    : "진행일"}
                              </span>
                            </div>
                          );
                        })()}
                        <strong>{e.title}</strong>
                        {(() => {
                          const range = getScheduleRange(e);
                          if (!range) return null;
                          const isRange =
                            toLocalDateKey(range.start) !==
                            toLocalDateKey(range.end);
                          if (isRange) {
                            return (
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {range.start.toLocaleDateString()} ~{" "}
                                {range.end.toLocaleDateString()}
                              </div>
                            );
                          }
                          return e.date ? (
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(e.date).toLocaleString()}
                            </div>
                          ) : null;
                        })()}
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                            style={{
                              backgroundColor: `${colorForCategory(
                                e.category,
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
                  </div>
                )}
            </AnimatePresence>

            {selectedDate && selectedDayFilteredEvents.length > 6 && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-1"
                onClick={() => setSelectedDayExpanded(prev => !prev)}
              >
                {selectedDayExpanded ? "접기" : `더 보기 (+${selectedDayFilteredEvents.length - 6})`}
              </Button>
            )}

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
          className="w-[min(94vw,1080px)] max-w-[1080px] sm:max-w-[1080px] max-h-none p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200/70 dark:border-slate-700/70"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void createSchedule(e as unknown as React.FormEvent);
            }
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-slate-200/70 dark:border-slate-700/70">
            <DialogTitle>새 일정 추가</DialogTitle>
          </DialogHeader>

          <form onSubmit={createSchedule} className="space-y-0">
            <div className="px-7 py-5 space-y-5">
              <div className="text-xs text-slate-500">
                작성일: {new Date().toLocaleString()}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)] gap-6">
                <div className="min-w-0 space-y-5">
                  <div className="space-y-2.5">
                    <Label>제목</Label>
                    <Input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label>일정 유형</Label>
                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-1 bg-slate-50/70 dark:bg-slate-900/40">
                      <button
                        type="button"
                        className={`rounded-lg px-3 py-2 text-sm whitespace-nowrap transition ${
                          createMode === "single"
                            ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                            : "text-slate-500 dark:text-slate-300"
                        }`}
                        onClick={() => setCreateMode("single")}
                      >
                        단일 일정
                      </button>
                      <button
                        type="button"
                        className={`rounded-lg px-3 py-2 text-sm whitespace-nowrap transition ${
                          createMode === "range"
                            ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                            : "text-slate-500 dark:text-slate-300"
                        }`}
                        onClick={() => setCreateMode("range")}
                      >
                        기간 일정
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label>날짜</Label>
                    {createMode === "single" ? (
                      <Input
                        type="datetime-local"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-slate-500">시작일</Label>
                          <Input
                            type="datetime-local"
                            value={rangeStartDate}
                            onChange={e => setRangeStartDate(e.target.value)}
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">마감일</Label>
                          <Input
                            type="datetime-local"
                            value={rangeEndDate}
                            onChange={e => setRangeEndDate(e.target.value)}
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <Label>메모</Label>
                    <Textarea
                      rows={6}
                      value={memo}
                      onChange={e => setMemo(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                  </div>
                </div>
                <div className="min-w-0 space-y-5">
                  <div className="space-y-2.5">
                    <Label>카테고리</Label>
                    <Select value={category || undefined} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-5 bg-slate-50/70 dark:bg-slate-900/40">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
                      onClick={() => setShowCreateCategoryPanel(v => !v)}
                    >
                      <span className="whitespace-nowrap">카테고리 색상/팔레트 설정</span>
                      <span className="whitespace-nowrap">{showCreateCategoryPanel ? "접기" : "열기"}</span>
                    </button>
                    {showCreateCategoryPanel && (
                      <div className="mt-4 min-w-0">
                        <CategoryColorPanel
                          paletteName={paletteName}
                          onChangePaletteName={setPaletteName}
                          onSavePalette={savePalette}
                          sortedPalettes={sortedPalettes}
                          paletteEditing={paletteEditing}
                          paletteEditName={paletteEditName}
                          onChangePaletteEditName={setPaletteEditName}
                          dragPaletteName={dragPaletteName}
                          onDragStartPalette={setDragPaletteName}
                          onReorderPalette={reorderPalette}
                          onToggleFavorite={toggleFavoritePalette}
                          onApplyPalette={p => applyPaletteColors(p.colors)}
                          onSavePaletteName={savePaletteName}
                          onStartPaletteEdit={name => {
                            setPaletteEditing(name);
                            setPaletteEditName(name);
                          }}
                          onDeletePalette={name =>
                            setSavedPalettes(s => s.filter(sp => sp.name !== name))
                          }
                          presetPalettes={presetPalettes}
                          onApplyPreset={applyPaletteColors}
                          allCategories={allCategories}
                          categoryFilter={categoryFilter}
                          onChangeCategoryFilter={setCategoryFilter}
                          palettePulse={palettePulse}
                          visibleCategories={visibleCategories}
                          defaultCategories={defaultCategories}
                          categoryColors={categoryColors}
                          colorForCategory={colorForCategory}
                          renderHighlighted={renderHighlighted}
                          onChangeCategoryColor={(cat, color) =>
                            setCategoryColors(s => ({ ...s, [cat]: color }))
                          }
                          onResetCategoryColor={cat =>
                            setCategoryColors(s => {
                              const next = { ...s };
                              delete next[cat];
                              return next;
                            })
                          }
                          onRemoveCustomCategory={removeCustomCategory}
                          newCategoryName={newCategoryName}
                          onChangeNewCategoryName={setNewCategoryName}
                          newCategoryColor={newCategoryColor}
                          onChangeNewCategoryColor={setNewCategoryColor}
                          onAddCategory={addCustomCategory}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {err && <p className="text-red-500 text-sm">{err}</p>}
            </div>
            <div className="px-6 py-3 border-t border-slate-200/70 dark:border-slate-700/70 bg-slate-50/60 dark:bg-slate-900/30">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">단축키: ⌘/Ctrl+Enter 추가</div>
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
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent
          className="w-[min(94vw,1080px)] max-w-[1080px] sm:max-w-[1080px] max-h-none p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200/70 dark:border-slate-700/70"
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void updateSchedule(e as unknown as React.FormEvent);
            }
          }}
        >
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-slate-200/70 dark:border-slate-700/70">
            <DialogTitle>일정 수정</DialogTitle>
          </DialogHeader>

          <form onSubmit={updateSchedule} className="space-y-0">
            <div className="px-7 py-5 space-y-5">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)] gap-6">
                <div className="min-w-0 space-y-5">
                  <div className="space-y-2.5">
                    <Label>제목</Label>
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label>일정 유형</Label>
                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-1 bg-slate-50/70 dark:bg-slate-900/40">
                      <button
                        type="button"
                        className={`rounded-lg px-3 py-2 text-sm whitespace-nowrap transition ${
                          editMode === "single"
                            ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                            : "text-slate-500 dark:text-slate-300"
                        }`}
                        onClick={() => setEditMode("single")}
                      >
                        단일 일정
                      </button>
                      <button
                        type="button"
                        className={`rounded-lg px-3 py-2 text-sm whitespace-nowrap transition ${
                          editMode === "range"
                            ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                            : "text-slate-500 dark:text-slate-300"
                        }`}
                        onClick={() => setEditMode("range")}
                      >
                        기간 일정
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label>날짜</Label>
                    {editMode === "single" ? (
                      <Input
                        type="datetime-local"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-slate-500">시작일</Label>
                          <Input
                            type="datetime-local"
                            value={editRangeStartDate}
                            onChange={e => setEditRangeStartDate(e.target.value)}
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">마감일</Label>
                          <Input
                            type="datetime-local"
                            value={editRangeEndDate}
                            onChange={e => setEditRangeEndDate(e.target.value)}
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <Label>메모</Label>
                    <Textarea
                      rows={6}
                      value={editMemo}
                      onChange={e => setEditMemo(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                  </div>
                </div>
                <div className="min-w-0 space-y-5">
                  <div className="space-y-2.5">
                    <Label>카테고리</Label>
                    <Select
                      value={editCategory || undefined}
                      onValueChange={setEditCategory}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-5 bg-slate-50/70 dark:bg-slate-900/40">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200"
                      onClick={() => setShowEditCategoryPanel(v => !v)}
                    >
                      <span className="whitespace-nowrap">카테고리 색상/팔레트 설정</span>
                      <span className="whitespace-nowrap">{showEditCategoryPanel ? "접기" : "열기"}</span>
                    </button>
                    {showEditCategoryPanel && (
                      <div className="mt-4 min-w-0">
                        <CategoryColorPanel
                          paletteName={paletteName}
                          onChangePaletteName={setPaletteName}
                          onSavePalette={savePalette}
                          sortedPalettes={sortedPalettes}
                          paletteEditing={paletteEditing}
                          paletteEditName={paletteEditName}
                          onChangePaletteEditName={setPaletteEditName}
                          dragPaletteName={dragPaletteName}
                          onDragStartPalette={setDragPaletteName}
                          onReorderPalette={reorderPalette}
                          onToggleFavorite={toggleFavoritePalette}
                          onApplyPalette={p => applyPaletteColors(p.colors)}
                          onSavePaletteName={savePaletteName}
                          onStartPaletteEdit={name => {
                            setPaletteEditing(name);
                            setPaletteEditName(name);
                          }}
                          onDeletePalette={name =>
                            setSavedPalettes(s => s.filter(sp => sp.name !== name))
                          }
                          presetPalettes={presetPalettes}
                          onApplyPreset={applyPaletteColors}
                          allCategories={allCategories}
                          categoryFilter={categoryFilter}
                          onChangeCategoryFilter={setCategoryFilter}
                          palettePulse={palettePulse}
                          visibleCategories={visibleCategories}
                          defaultCategories={defaultCategories}
                          categoryColors={categoryColors}
                          colorForCategory={colorForCategory}
                          renderHighlighted={renderHighlighted}
                          onChangeCategoryColor={(cat, color) =>
                            setCategoryColors(s => ({ ...s, [cat]: color }))
                          }
                          onResetCategoryColor={cat =>
                            setCategoryColors(s => {
                              const next = { ...s };
                              delete next[cat];
                              return next;
                            })
                          }
                          onRemoveCustomCategory={removeCustomCategory}
                          newCategoryName={newCategoryName}
                          onChangeNewCategoryName={setNewCategoryName}
                          newCategoryColor={newCategoryColor}
                          onChangeNewCategoryColor={setNewCategoryColor}
                          onAddCategory={addCustomCategory}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {err && <p className="text-red-500 text-sm">{err}</p>}
            </div>
            <div className="px-6 py-3 border-t border-slate-200/70 dark:border-slate-700/70 bg-slate-50/60 dark:bg-slate-900/30">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">단축키: ⌘/Ctrl+Enter 저장</div>
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
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
