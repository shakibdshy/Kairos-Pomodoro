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
      onClick={() => !menuOpen && onToggleActive()}
      className={cn(
        "group relative bg-white border rounded-2xl p-6 transition-all cursor-pointer hover:shadow-md border-l-4",
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
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
            isComplete
              ? "bg-green-500 border-green-500 text-white"
              : isActive
                ? "border-sahara-primary bg-sahara-primary-light/30"
                : "border-sahara-border/40 group-hover:border-sahara-primary/40",
          )}
        >
          {isComplete && <CheckCircle2 className="w-4 h-4" />}
          {isActive && !isComplete && (
            <Target className="w-3 h-3 text-sahara-primary" />
          )}
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="text-sahara-text-muted hover:text-sahara-text transition-colors p-1"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-8 z-20 bg-white border border-sahara-border/20 rounded-xl shadow-lg py-1 w-36 animate-in fade-in slide-in-from-top-2 duration-150">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit(task);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-sahara-text-secondary hover:bg-sahara-bg/50 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
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
          <Clock className="w-3.5 h-3.5 text-sahara-text-muted" />
          <span className="text-xs font-bold text-sahara-text-secondary tabular-nums">
            {task.completed_pomos}/{task.estimated_pomos}{" "}
            <span className="text-[10px] text-sahara-text-muted uppercase tracking-widest ml-1">
              Pomos
            </span>
          </span>
        </div>

        {isActive ? (
          <div className="flex items-center gap-1.5 text-sahara-primary">
            <Target className="w-3.5 h-3.5" />
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
                    "w-2 h-2 rounded-full transition-colors",
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
