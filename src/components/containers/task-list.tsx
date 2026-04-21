import { useTaskStore } from "@/features/tasks/use-task-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { ChevronRight, Target } from "lucide-react";

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const activeTaskId = useTimerStore((s) => s.activeTaskId);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="w-full">
      {activeTask ? (
        <div className="group bg-sahara-surface border border-sahara-border/20 rounded-2xl p-6 flex items-center gap-6 cursor-pointer hover:border-sahara-primary/30 transition-all shadow-sm shadow-sahara-primary/5">
          <div className="w-12 h-12 rounded-xl bg-sahara-primary-light flex items-center justify-center text-sahara-primary shrink-0 group-hover:scale-105 transition-transform">
            <Target className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-serif text-xl text-sahara-text truncate">
              {activeTask.name}
            </h4>
            <p className="text-xs text-sahara-text-muted mt-1 font-bold tracking-wider uppercase">
              Project: {activeTask.project || "General"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-sahara-primary tabular-nums">
                {activeTask.completed_pomos}
              </span>
              <span className="text-xs font-bold text-sahara-text-muted tabular-nums">
                /{activeTask.estimated_pomos}
              </span>
              <p className="text-[10px] text-sahara-text-muted font-bold tracking-widest uppercase mt-0.5">
                Pomos
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-sahara-border group-hover:text-sahara-primary transition-colors" />
          </div>
        </div>
      ) : (
        <div className="bg-sahara-card/50 border border-dashed border-sahara-border/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 cursor-pointer hover:bg-sahara-card transition-colors">
          <div className="w-12 h-12 rounded-full bg-sahara-surface flex items-center justify-center text-sahara-text-muted shadow-sm">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-sahara-text-secondary">
              No active task
            </p>
            <p className="text-xs text-sahara-text-muted mt-1">
              Select a task from the Tasks page to track progress
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
