import { useState, useEffect } from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { getCompletedTasksForPeriod, type CompletedTaskEntry } from "@/lib/db";
import { formatTotalTime } from "@/lib/session-utils";

interface CompletedTasksProps {
  startDate?: string;
  endDate?: string;
}

export function CompletedTasks({ startDate, endDate }: CompletedTasksProps) {
  const [tasks, setTasks] = useState<CompletedTaskEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCompletedTasksForPeriod(startDate, endDate)
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
        <p className="text-xs text-sahara-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
      {/* <h3 className="text-xs md:text-sm font-bold text-sahara-text-muted uppercase tracking-wider mb-4 md:mb-5">
        Tasks Worked On
      </h3> */}

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <ClipboardList className="w-8 h-8 text-sahara-text-muted/40" />
          <p className="text-[15px] text-sahara-text-muted text-center">
            No tasks in this period
          </p>
          <p className="text-xs text-sahara-text-muted/60">
            Tasks linked to focus sessions will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const progress =
              task.estimated_pomos > 0
                ? Math.min(
                    Math.round(
                      (task.completed_pomos / task.estimated_pomos) * 100,
                    ),
                    100,
                  )
                : 0;

            return (
              <div
                key={task.task_id}
                className="group flex items-center gap-3 md:gap-4 bg-sahara-bg/30 border border-sahara-border/10 rounded-xl p-3 md:p-3.5 hover:border-sahara-border/25 transition-all"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-sahara-primary-light/60 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5 text-sahara-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[17px] font-semibold text-sahara-text truncate">
                      {task.task_name}
                    </p>
                    {task.category_name && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-sahara-border/20 bg-sahara-surface shrink-0">
                        <span
                          className="w-1.75 h-1.75 rounded-full"
                          style={{
                            backgroundColor: task.category_color ?? "#94a3b8",
                          }}
                        />
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: task.category_color ?? "#94a3b8" }}
                        >
                          {task.category_name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.75 bg-sahara-bg/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sahara-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-sahara-text-muted tabular-nums shrink-0">
                      {task.completed_pomos}/{task.estimated_pomos}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right ml-2">
                  <p className="text-sm font-bold text-sahara-text-secondary tabular-nums">
                    {formatTotalTime(task.total_seconds)}
                  </p>
                  <p className="text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider">
                    {task.session_count}
                    {task.session_count === 1 ? " session" : " sessions"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
