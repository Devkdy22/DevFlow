import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export type PaletteItem = {
  name: string;
  colors: string[];
  favorite?: boolean;
  createdAt?: number;
};

type PresetPalette = {
  label: string;
  colors: string[];
};

type CategoryColorPanelProps = {
  paletteName: string;
  onChangePaletteName: (value: string) => void;
  onSavePalette: () => void;
  sortedPalettes: PaletteItem[];
  paletteEditing: string | null;
  paletteEditName: string;
  onChangePaletteEditName: (value: string) => void;
  dragPaletteName: string | null;
  onDragStartPalette: (name: string) => void;
  onReorderPalette: (targetName: string) => void;
  onToggleFavorite: (name: string) => void;
  onApplyPalette: (palette: PaletteItem) => void;
  onSavePaletteName: (name: string) => void;
  onStartPaletteEdit: (name: string) => void;
  onDeletePalette: (name: string) => void;
  presetPalettes: PresetPalette[];
  onApplyPreset: (colors: string[]) => void;
  allCategories: string[];
  categoryFilter: string;
  onChangeCategoryFilter: (value: string) => void;
  palettePulse: boolean;
  visibleCategories: string[];
  defaultCategories: string[];
  categoryColors: Record<string, string>;
  colorForCategory: (category?: string) => string;
  renderHighlighted: (name: string) => ReactNode;
  onChangeCategoryColor: (category: string, color: string) => void;
  onResetCategoryColor: (category: string) => void;
  onRemoveCustomCategory: (category: string) => void;
  newCategoryName: string;
  onChangeNewCategoryName: (value: string) => void;
  newCategoryColor: string;
  onChangeNewCategoryColor: (value: string) => void;
  onAddCategory: () => void;
};

export function CategoryColorPanel({
  paletteName,
  onChangePaletteName,
  onSavePalette,
  sortedPalettes,
  paletteEditing,
  paletteEditName,
  onChangePaletteEditName,
  dragPaletteName,
  onDragStartPalette,
  onReorderPalette,
  onToggleFavorite,
  onApplyPalette,
  onSavePaletteName,
  onStartPaletteEdit,
  onDeletePalette,
  presetPalettes,
  onApplyPreset,
  allCategories,
  categoryFilter,
  onChangeCategoryFilter,
  palettePulse,
  visibleCategories,
  defaultCategories,
  categoryColors,
  colorForCategory,
  renderHighlighted,
  onChangeCategoryColor,
  onResetCategoryColor,
  onRemoveCustomCategory,
  newCategoryName,
  onChangeNewCategoryName,
  newCategoryColor,
  onChangeNewCategoryColor,
  onAddCategory,
}: CategoryColorPanelProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 p-5 space-y-5 bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-slate-900/70 dark:to-slate-950/60 shadow-inner">
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        카테고리 색상
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="팔레트 이름"
            value={paletteName}
            onChange={e => onChangePaletteName(e.target.value)}
            className="h-9 w-48"
          />
          <Button type="button" onClick={onSavePalette}>
            팔레트 저장
          </Button>
        </div>

        {sortedPalettes.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {sortedPalettes.map(p => (
              <motion.div
                key={p.name}
                layout
                whileHover={{ y: -2 }}
                className="flex max-w-full items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs"
                draggable
                onDragStart={() => onDragStartPalette(p.name)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => {
                  if (!dragPaletteName || dragPaletteName === p.name) return;
                  onReorderPalette(p.name);
                }}
              >
                <button
                  type="button"
                  className={`mr-1 ${p.favorite ? "text-amber-500" : "text-slate-400"}`}
                  title="즐겨찾기"
                  onClick={() => onToggleFavorite(p.name)}
                >
                  ★
                </button>

                {paletteEditing === p.name ? (
                  <input
                    className="bg-transparent outline-none w-20"
                    value={paletteEditName}
                    onChange={e => onChangePaletteEditName(e.target.value)}
                  />
                ) : (
                  <button type="button" onClick={() => onApplyPalette(p)}>
                    {p.name}
                  </button>
                )}

                {paletteEditing === p.name ? (
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-700"
                    onClick={() => onSavePaletteName(p.name)}
                  >
                    저장
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => onStartPaletteEdit(p.name)}
                  >
                    편집
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDeletePalette(p.name)}
                  className="text-slate-400 hover:text-slate-600"
                  title="삭제"
                >
                  ✕
                </button>

                <span className="inline-flex items-center gap-1">
                  {p.colors.slice(0, 3).map(c => (
                    <span
                      key={`${p.name}-${c}`}
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          {presetPalettes.map(p => (
            <button
              key={p.label}
              type="button"
              className="px-2.5 py-1 rounded-full text-xs border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70"
              onClick={() => onApplyPreset(p.colors)}
            >
              <span className="mr-2">{p.label}</span>
              <span className="inline-flex items-center gap-1">
                {p.colors.map(c => (
                  <span
                    key={`${p.label}-${c}`}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {allCategories.length === 0 && (
          <div className="text-xs text-slate-500">아직 카테고리가 없습니다.</div>
        )}
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="카테고리 검색"
            value={categoryFilter}
            onChange={e => onChangeCategoryFilter(e.target.value)}
            className="h-8 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
          />
          <button
            type="button"
            className="shrink-0 whitespace-nowrap text-xs text-slate-500"
            onClick={() => onChangeCategoryFilter("")}
          >
            초기화
          </button>
        </div>

        <div
          className={`grid grid-cols-1 gap-3 h-[198px] overflow-y-auto pr-1 ${
            palettePulse
              ? "animate-[paletteGlow_0.7s_ease-in-out_1] ring-2 ring-indigo-300/50 rounded-xl p-1"
              : ""
          }`}
        >
          {visibleCategories.map(cat => {
            const isDefault = defaultCategories.includes(cat);
            const isCustom = !isDefault;
            const hasOverride = !!categoryColors[cat];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 px-3 py-3"
              >
                <span
                  className="inline-flex min-w-0 items-center gap-2 text-xs"
                  style={{ color: colorForCategory(cat) }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colorForCategory(cat) }}
                  />
                  <span className="truncate">{renderHighlighted(cat)}</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={colorForCategory(cat)}
                    onChange={e => onChangeCategoryColor(cat, e.target.value)}
                    className="h-7 w-9 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
                  />

                  {isDefault ? (
                    hasOverride && (
                      <button
                        type="button"
                        className="text-xs text-slate-500"
                        onClick={() => onResetCategoryColor(cat)}
                      >
                        ↺
                      </button>
                    )
                  ) : isCustom ? (
                    <button
                      type="button"
                      className="text-xs text-slate-500"
                      onClick={() => onRemoveCustomCategory(cat)}
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Input
          placeholder="새 카테고리"
          value={newCategoryName}
          onChange={e => onChangeNewCategoryName(e.target.value)}
          className="min-w-0 flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
        />
        <input
          type="color"
          value={newCategoryColor}
          onChange={e => onChangeNewCategoryColor(e.target.value)}
          className="h-9 w-12 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
        />
        <Button type="button" onClick={onAddCategory}>
          추가
        </Button>
      </div>
    </div>
  );
}
