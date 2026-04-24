import { Target, ChevronRight, Clock } from "lucide-react";
import type { Task } from "@/features/tasks/task-types";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/session-utils";

interface ActiveTaskCardProps {
  task: Task | null;
  taskTimeToday: number;
}

export function ActiveTaskCard({ task, taskTimeToday }: ActiveTaskCardProps) {
  if (!task) {
    return (
      <div className="bg-sahara-card/30 border border-dashed border-sahara-border/50 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center gap-2.5 md:gap-3">
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-sahara-surface flex items-center justify-center text-sahara-text-muted shadow-sm">
          <Target className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-sahara-text-secondary">
            No active task
          </p>
          <p className="text-xs text-sahara-text-muted mt-0.5">
            Select a task from the Tasks page to track progress
          </p>
        </div>
      </div>
    );
  }

  const progressPct =
    task.estimated_pomos > 0
      ? Math.min(
          100,
          Math.round((task.completed_pomos / task.estimated_pomos) * 100),
        )
      : 0;

  return (
    <div className="group bg-sahara-surface border border-sahara-border/20 rounded-2xl p-3.5 md:p-5 flex items-center gap-3 md:gap-5 cursor-pointer hover:border-sahara-primary/30 transition-all shadow-sm shadow-sahara-primary/5">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-sahara-primary-light flex items-center justify-center text-sahara-primary shrink-0 group-hover:scale-105 transition-transform">
        <Target className="w-5 h-5 md:w-6 md:h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-serif text-base md:text-lg text-sahara-text truncate font-semibold">
          {task.name}
        </h4>
        <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-1.5 flex-wrap">
          <span className="text-[10px] md:text-[11px] font-bold text-sahara-text-muted tracking-wider uppercase">
            {task.project || "General"}
          </span>
          {taskTimeToday > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] md:text-[11px] font-medium text-sahara-primary bg-sahara-primary-light/40 px-1.5 md:px-2 py-0.5 rounded-full">
              <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
              {formatDuration(taskTimeToday)} today
            </span>
          )}
        </div>

        <div className="mt-1.5 md:mt-2.5 flex items-center gap-2 md:gap-3">
          {task.estimated_pomos > 0 && (
            <>
              <div className="flex-1 h-1.5 md:h-2 bg-sahara-bg/60 rounded-full overflow-hidden max-w-[120px] md:max-w-none">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    progressPct >= 100
                      ? "bg-green-500"
                      : "bg-sahara-primary",
                  )}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-sahara-text-muted tabular-nums shrink-0">
                {task.completed_pomos}/{task.estimated_pomos}
              </span>
            </>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-sahara-text-muted/40 group-hover:text-sahara-text-muted shrink-0 transition-colors hidden sm:block" />
    </div>
  );
}
