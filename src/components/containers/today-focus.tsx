import { useState, useEffect, useCallback } from "react";
import { Text } from "@/components/ui/text";
import { useTaskStore } from "@/features/tasks/use-task-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import {
  getTodaySessions,
  getCategoryBreakdown,
  getTaskTimeToday,
} from "@/lib/db";
import type { Session } from "@/lib/db";
import type { CategoryBreakdown as CategoryBreakdownType } from "@/lib/db";
import { FocusSummaryBar } from "@/components/base/focus-summary-bar";
import { CategoryBreakdown as CategoryBars } from "@/components/base/category-breakdown";
import { ActiveTaskCard } from "@/components/base/active-task-card";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/constants";

export function TodayFocus() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [breakdowns, setBreakdowns] = useState<CategoryBreakdownType[]>([]);
  const [taskTimeToday, setTaskTimeToday] = useState(0);

  const tasks = useTaskStore((s) => s.tasks);
  const activeTaskId = useTimerStore((s) => s.activeTaskId);

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

  const refreshData = useCallback(async () => {
    const [todaySessions, categoryData] = await Promise.all([
      getTodaySessions().catch(() => []),
      getCategoryBreakdown().catch(() => []),
    ]);
    setSessions(todaySessions);
    setBreakdowns(categoryData);

    if (activeTaskId) {
      const time = await getTaskTimeToday(activeTaskId).catch(() => 0);
      setTaskTimeToday(time);
    } else {
      setTaskTimeToday(0);
    }
  }, [activeTaskId]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const workSessions = sessions.filter((s) => s.phase === "work");
  const topCategoryEntry = (() => {
    const counts: Record<
      string,
      { name: string; color: string; count: number }
    > = {};
    workSessions.forEach((s) => {
      if (s.intention) {
        if (!counts[s.intention]) {
          counts[s.intention] = {
            name: s.intention,
            color: DEFAULT_CATEGORY_COLOR,
            count: 0,
          };
        }
        counts[s.intention].count++;
      }
    });
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    return sorted[0] ?? null;
  })();

  const hasAnyData = sessions.length > 0 || breakdowns.length > 0;

  return (
    <div className="w-full space-y-4 md:space-y-5">
      <FocusSummaryBar sessions={sessions} topCategory={topCategoryEntry} />

      {hasAnyData && (
        <div className="bg-sahara-surface rounded-xl border border-sahara-border/15 p-3.5 md:p-5">
          <Text
            variant="body"
            className="text-[10px] md:text-xs font-bold text-sahara-text-muted uppercase tracking-wider mb-2.5 md:mb-3"
          >
            Time by Category
          </Text>
          <CategoryBars breakdowns={breakdowns} />
        </div>
      )}

      <ActiveTaskCard task={activeTask} taskTimeToday={taskTimeToday} />
    </div>
  );
}
