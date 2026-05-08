import { Target, Clock, CheckCircle2, Trash2, Edit3 } from "lucide-react";
import type { Task } from "@/features/tasks/task-types";
import { cn } from "@/lib/cn";

interface TaskListCardProps {
  task: Task;
  isActive: boolean;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCompletePomo: () => void;
}

export function TaskListCard({
  task,
  isActive,
  onToggleActive,
  onEdit,
  onDelete,
  onCompletePomo,
}: TaskListCardProps) {
  const isDone = task.completed_pomos >= task.estimated_pomos;

  return (
    <div
      onClick={() => !isDone && onToggleActive()}
      className={cn(
        "group relative bg-sahara-surface border border-sahara-border/15 rounded-xl md:rounded-2xl p-3.5 md:p-5 transition-all cursor-pointer",
        isDone
          ? "opacity-60 hover:opacity-80 border-sahara-border/10"
          : "hover:border-sahara-primary/25 hover:shadow-sm",
        isActive && !isDone &&
          "border-sahara-primary/40 shadow-md shadow-sahara-primary/5",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
        <span
          className={cn(
            "px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider",
            isActive
              ? "bg-sahara-primary-light text-sahara-primary"
              : "bg-sahara-card text-sahara-text-muted",
          )}
        >
          {task.project || "General"}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {!isDone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompletePomo();
              }}
              className="p-1 rounded-lg hover:bg-sahara-card transition-colors cursor-pointer"
              title="Complete pomodoro"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 rounded-lg hover:bg-sahara-card transition-colors cursor-pointer"
            title="Edit task"
          >
            <Edit3 className="w-3.5 h-3.5 text-sahara-text-muted hover:text-sahara-text" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      <h3
        className={cn(
          "font-serif text-base md:text-lg leading-snug",
          isDone
            ? "line-through text-sahara-text-muted"
            : "text-sahara-text",
        )}
      >
        {task.name}
      </h3>

      <div className="flex items-center gap-3 mt-2 md:mt-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Target className="w-3 h-3 md:w-3.5 md:h-3.5 text-sahara-primary" />
          <span className="text-[10px] md:text-xs font-bold text-sahara-text-secondary tabular-nums">
            {task.completed_pomos}/{task.estimated_pomos}{" "}
            <span className="text-sahara-text-muted font-normal">
              pomos
            </span>
          </span>
        </div>

        {isActive && !isDone && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
            <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 animate-pulse" />
            Active
          </div>
        )}

        {isDone && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sahara-bg text-sahara-text-muted text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
            Done
          </span>
        )}
      </div>

      {task.estimated_pomos > 0 && (
        <div className="mt-2 md:mt-3 h-1.5 bg-sahara-bg/60 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isDone ? "bg-green-500" : "bg-sahara-primary",
            )}
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  (task.completed_pomos / task.estimated_pomos) * 100,
                ),
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
