import { Flame, Clock, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import type { WeekSummary } from "@/lib/db";

interface CalendarWeekStatsProps {
  summary: WeekSummary;
}

function formatHours(sec: number): string {
  if (sec === 0) return "0h";
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function CalendarWeekStats({ summary }: CalendarWeekStatsProps) {
  const stats = [
    {
      icon: Clock,
      label: "Total Focus",
      value: formatHours(summary.total_seconds),
      color: "text-sahara-primary",
      bg: "bg-sahara-primary-light",
    },
    {
      icon: Target,
      label: "Sessions",
      value: `${summary.work_sessions} work · ${summary.break_sessions} break`,
      color: "text-sahara-text-secondary",
      bg: "bg-sahara-card",
    },
    {
      icon: Flame,
      label: "Daily Avg",
      value: formatHours(summary.avg_daily_seconds),
      color: "text-sahara-primary",
      bg: "bg-sahara-primary-light",
    },
    {
      icon: TrendingUp,
      label: "Peak Day",
      value: summary.peak_day
        ? `${new Date(summary.peak_day + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} (${formatHours(summary.peak_day_seconds)})`
        : "—",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-sahara-surface border border-sahara-border/30 rounded-xl p-3"
          >
            <div
              className={cn(
                "size-8 rounded-lg flex items-center justify-center mb-2",
                stat.bg,
              )}
            >
              <Icon className={cn("size-4", stat.color)} />
            </div>
            <p className="text-[9px] font-semibold text-sahara-text-muted uppercase tracking-wider">
              {stat.label}
            </p>
            <p
              className={cn(
                "text-xs md:text-sm font-bold mt-1 leading-tight",
                stat.color,
              )}
            >
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
