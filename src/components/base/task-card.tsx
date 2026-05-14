import { useState } from "react";
import {
  Target,
  Clock,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit3,
} from "lucide-react";
import type { Task } from "@/features/tasks/task-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  onToggleActive: () => void;
  onDelete?: () => void;
  onEdit?: (task: Task) => void;
}

export function TaskCard({
  task,
  isActive,
  onToggleActive,
  onDelete,
  onEdit,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isComplete = task.completed_pomos >= task.estimated_pomos;

  const priorityColors: Record<string, string> = {
    high: "border-l-red-400",
    medium: "border-l-yellow-400",
    low: "border-l-blue-300",
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !menuOpen && onToggleActive()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !menuOpen) {
          e.preventDefault();
          onToggleActive();
        }
      }}
      className={cn(
        "group relative bg-sahara-surface border rounded-2xl p-6 transition-all cursor-pointer hover:shadow-md border-l-4",
        isComplete
          ? "border-sahara-border/15 opacity-70"
          : isActive
            ? "border-sahara-primary ring-1 ring-sahara-primary/20 shadow-lg shadow-sahara-primary/5 border-l-sahara-primary"
            : "border-sahara-border/20 hover:border-sahara-primary/30",
        task.priority && !isComplete ? priorityColors[task.priority] || "" : "",
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "size-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
            isComplete
              ? "bg-green-500 border-green-500 text-white"
              : isActive
                ? "border-sahara-primary bg-sahara-primary-light/30"
                : "border-sahara-border/40 group-hover:border-sahara-primary/40",
          )}
        >
          {isComplete && <CheckCircle2 className="size-4" />}
          {isActive && !isComplete && (
            <Target className="size-3 text-sahara-primary" />
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="text-sahara-text-muted hover:text-sahara-text"
          >
            <MoreVertical className="size-4" />
          </Button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }
                }}
              />
              <div className="absolute right-0 top-8 z-20 bg-sahara-surface border border-sahara-border/20 rounded-xl shadow-lg py-1 w-36 animate-in fade-in slide-in-from-top-2 duration-150">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="xs"
                    fullWidth
                    intent="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit(task);
                    }}
                    className="gap-2 text-xs font-medium text-sahara-text-secondary hover:bg-sahara-bg/50"
                  >
                    <Edit3 className="size-3.5" /> Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="xs"
                    fullWidth
                    intent="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="gap-2 text-xs font-medium hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <h3
        className={cn(
          "font-serif text-xl mb-2 leading-tight",
          isComplete
            ? "text-sahara-text-muted line-through"
            : "text-sahara-text",
        )}
      >
        {task.name}
      </h3>

      {(task.project || task.priority) && (
        <div className="flex items-center gap-2 mb-4">
          {task.project && (
            <span className="text-[10px] font-bold tracking-widest text-sahara-text-muted uppercase">
              {task.project}
            </span>
          )}
          {task.priority && (
            <span
              className={cn(
                "text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-md",
                task.priority === "high"
                  ? "bg-red-50 text-red-500"
                  : task.priority === "medium"
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-blue-50 text-blue-400",
              )}
            >
              {task.priority}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-sahara-border/10">
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-sahara-text-muted" />
          <span className="text-xs font-bold text-sahara-text-secondary tabular-nums">
            {task.completed_pomos}/{task.estimated_pomos}{" "}
            <span className="text-[10px] text-sahara-text-muted uppercase tracking-widest ml-1">
              Pomos
            </span>
          </span>
        </div>

        {isActive ? (
          <div className="flex items-center gap-1.5 text-sahara-primary">
            <Target className="size-3.5" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              Active
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-bold tracking-widest uppercase text-sahara-text-muted group-hover:text-sahara-primary transition-colors">
            Link Session
          </span>
        )}

        {!isComplete && (
          <div className="ml-auto flex items-center gap-1">
            {Array.from({ length: Math.min(task.estimated_pomos, 8) }).map(
              (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    i < task.completed_pomos
                      ? "bg-green-400"
                      : "bg-sahara-border/25",
                  )}
                />
              ),
            )}
            {task.estimated_pomos > 8 && (
              <span className="text-[9px] text-sahara-text-muted ml-1">
                +{task.estimated_pomos - 8}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
