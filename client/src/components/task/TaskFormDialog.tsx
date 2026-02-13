import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type TaskStatus = "todo" | "doing" | "done";

type ProjectOption = {
  _id: string;
  title: string;
};

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  title: string;
  submitLabel: string;
  onSubmit: () => void;
  taskTitle: string;
  onChangeTaskTitle: (value: string) => void;
  dueDate: string;
  onChangeDueDate: (value: string) => void;
  memo: string;
  onChangeMemo: (value: string) => void;
  status: TaskStatus;
  onChangeStatus: (status: TaskStatus) => void;
  showProjectSelect?: boolean;
  projectId?: string;
  onChangeProjectId?: (projectId: string) => void;
  projects?: ProjectOption[];
  createdAt?: string;
  updatedAt?: string;
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "할 일",
  doing: "진행 중",
  done: "완료",
};

export function TaskFormDialog({
  open,
  onOpenChange,
  mode,
  title,
  submitLabel,
  onSubmit,
  taskTitle,
  onChangeTaskTitle,
  dueDate,
  onChangeDueDate,
  memo,
  onChangeMemo,
  status,
  onChangeStatus,
  showProjectSelect = false,
  projectId = "",
  onChangeProjectId,
  projects = [],
  createdAt,
  updatedAt,
}: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onKeyDown={e => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "create" && (
            <div className="text-xs text-slate-500">작성일: {new Date().toLocaleString()}</div>
          )}

          {(createdAt || updatedAt) && mode === "edit" && (
            <div className="text-xs text-slate-500">
              {createdAt && <span>작성: {new Date(createdAt).toLocaleString()}</span>}
              {updatedAt && (
                <span className="ml-2">수정: {new Date(updatedAt).toLocaleString()}</span>
              )}
            </div>
          )}

          {showProjectSelect && onChangeProjectId && (
            <div>
              <div className="text-xs text-slate-500 mb-1">프로젝트</div>
              <Select value={projectId} onValueChange={onChangeProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="프로젝트 선택" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {projects.map(project => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Input
            placeholder="제목"
            value={taskTitle}
            onChange={e => onChangeTaskTitle(e.target.value)}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
          />

          <div>
            <div className="text-xs text-slate-500 mb-1">마감일</div>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={e => onChangeDueDate(e.target.value)}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">메모</div>
            <Textarea
              placeholder="메모를 입력하세요"
              value={memo}
              onChange={e => onChangeMemo(e.target.value)}
              rows={3}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
          </div>

          <Select value={status} onValueChange={value => onChangeStatus(value as TaskStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">{STATUS_LABEL.todo}</SelectItem>
              <SelectItem value="doing">{STATUS_LABEL.doing}</SelectItem>
              <SelectItem value="done">{STATUS_LABEL.done}</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onSubmit}>{submitLabel}</Button>
          <div className="text-xs text-slate-500">
            단축키: ⌘/Ctrl+Enter {mode === "create" ? "생성" : "저장"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
