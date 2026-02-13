import { AlertCircle, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { DragEvent } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export type BoardTask = {
  _id: string;
  title: string;
  projectId?: string;
  status?: "todo" | "doing" | "done";
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  memo?: string;
};

type BoardColumn = "todo" | "doing" | "done";

type TaskColumnProps = {
  column: BoardColumn;
  title: string;
  colorClassName: string;
  tasks: BoardTask[];
  dragOver: boolean;
  draggingId: string | null;
  highlightId: string;
  isHighlighting: boolean;
  onDragEnterColumn: (column: BoardColumn) => void;
  onDragLeaveColumn: () => void;
  onDropColumn: (column: BoardColumn, event: DragEvent) => void;
  onDragStartTask: (task: BoardTask, event: DragEvent) => void;
  onDragEndTask: () => void;
  onOpenTask: (task: BoardTask) => void;
  onDeleteTask: (id: string) => void;
  onAdvanceTask: (task: BoardTask) => void;
  showProjectName?: boolean;
  getProjectName?: (projectId?: string) => string;
};

export function TaskColumn({
  column,
  title,
  colorClassName,
  tasks,
  dragOver,
  draggingId,
  highlightId,
  isHighlighting,
  onDragEnterColumn,
  onDragLeaveColumn,
  onDropColumn,
  onDragStartTask,
  onDragEndTask,
  onOpenTask,
  onDeleteTask,
  onAdvanceTask,
  showProjectName = false,
  getProjectName,
}: TaskColumnProps) {
  return (
    <motion.div
      layout
      className={`flex flex-col rounded-2xl p-2 transition ${
        dragOver
          ? "bg-indigo-50/80 dark:bg-indigo-900/20 ring-1 ring-indigo-300/60"
          : "bg-transparent"
      }`}
      onDragOver={e => {
        e.preventDefault();
        onDragEnterColumn(column);
      }}
      onDragLeave={onDragLeaveColumn}
      onDrop={e => onDropColumn(column, e)}
    >
      <div
        className={`mb-4 px-4 py-2 rounded-xl bg-gradient-to-r ${colorClassName} text-white shadow-md`}
      >
        {title} ({tasks.length})
      </div>

      <div className="space-y-3 flex-1">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div
              key={task._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card
                className={`p-4 backdrop-blur bg-white/60 dark:bg-slate-800/60 cursor-pointer transition ${
                  draggingId === task._id ? "opacity-50" : "hover:shadow-xl"
                } ${
                  highlightId === task._id && isHighlighting
                    ? "ring-2 ring-amber-300/90 shadow-[0_0_18px_rgba(251,191,36,0.45)]"
                    : ""
                }`}
                draggable
                onDragStart={e => onDragStartTask(task, e)}
                onDragEnd={onDragEndTask}
                onClick={() => onOpenTask(task)}
              >
                <div>
                  <div className="flex justify-between mb-2">
                    <h3>{task.title}</h3>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteTask(task._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>

                  {showProjectName && (
                    <div className="mb-2">
                      <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/70 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                        {getProjectName?.(task.projectId) ?? "프로젝트 미지정"}
                      </span>
                    </div>
                  )}

                  {task.dueDate && (
                    <div className="text-sm flex items-center gap-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      마감일: {new Date(task.dueDate).toLocaleString()}
                    </div>
                  )}

                  {(task.createdAt || task.updatedAt) && (
                    <div className="mt-2 text-xs text-slate-500">
                      {task.createdAt && (
                        <span>작성: {new Date(task.createdAt).toLocaleString()}</span>
                      )}
                      {task.updatedAt && (
                        <span className="ml-2">
                          수정: {new Date(task.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  {task.memo && (
                    <div className="mt-2 text-xs text-slate-600">메모: {task.memo}</div>
                  )}

                  <div className="flex justify-between mt-3">
                    {column !== "done" && (
                      <Button
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          onAdvanceTask(task);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        다음 단계
                      </Button>
                    )}
                  </div>

                  {task.dueDate &&
                    new Date(task.dueDate) < new Date() &&
                    column !== "done" && (
                      <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        마감 초과
                      </div>
                    )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
