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
      <div className="bg-sahara-surface/40 backdrop-blur-sm border-2 border-dashed border-sahara-border/30 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center gap-4 group transition-all duration-300 hover:border-sahara-primary/20">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-sahara-surface flex items-center justify-center text-sahara-text-muted/40 shadow-sm border border-sahara-border/5 group-hover:scale-110 transition-transform duration-300">
          <Target className="w-6 h-6 md:w-7 md:h-7" />
        </div>
        <div className="max-w-xs">
          <p className="text-sm md:text-base font-black text-sahara-text-secondary tracking-tight">
            No Active Focus
          </p>
          <p className="text-xs md:text-sm text-sahara-text-muted/60 mt-1 leading-relaxed">
            Select a task from your list to start tracking your progress and stay focused.
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
    <div className="group relative bg-sahara-surface border border-sahara-border/15 rounded-3xl p-4 md:p-6 flex items-center gap-4 md:gap-6 cursor-pointer hover:border-sahara-primary/30 hover:shadow-xl hover:shadow-sahara-primary/5 transition-all duration-300 overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-sahara-primary/5 rounded-full blur-3xl group-hover:bg-sahara-primary/10 transition-colors duration-500" />

      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-sahara-primary/10 flex items-center justify-center text-sahara-primary shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:bg-sahara-primary/15 shadow-sm border border-sahara-primary/5">
        <Target className="w-6 h-6 md:w-8 md:h-8" />
      </div>

      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="font-serif text-lg md:text-xl text-sahara-text truncate font-black tracking-tight leading-tight">
              {task.name}
            </h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] md:text-xs font-black text-sahara-primary/80 tracking-widest uppercase bg-sahara-primary/5 px-2 py-0.5 rounded-md border border-sahara-primary/10">
                {task.project || "General"}
              </span>
              {taskTimeToday > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-sahara-text-secondary bg-sahara-card/60 px-2 py-0.5 rounded-md border border-sahara-border/10">
                  <Clock className="w-3 h-3 text-sahara-primary" />
                  {formatDuration(taskTimeToday)} today
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-sahara-text-muted/40 group-hover:text-sahara-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
        </div>

        <div className="mt-4 md:mt-6">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[10px] md:text-xs font-black text-sahara-text-muted uppercase tracking-widest">
              Progress
            </span>
            <span className="text-[11px] md:text-sm font-black text-sahara-text tabular-nums">
              {task.completed_pomos} / {task.estimated_pomos} <span className="text-sahara-text-muted font-bold ml-1">Pomos</span>
            </span>
          </div>
          <div className="h-2.5 md:h-3 bg-sahara-bg/60 rounded-full overflow-hidden border border-sahara-border/5">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                progressPct >= 100 ? "bg-emerald-500" : "bg-sahara-primary",
              )}
              style={{ width: `${progressPct}%` }}
            >
               <div className="w-full h-full opacity-20 bg-linear-to-r from-transparent via-white to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
