import { CheckCircle2, Target, TrendingUp, Zap } from "lucide-react";
import type { Session } from "@/lib/session-utils";
import { formatDuration, formatTotalTime } from "@/lib/session-utils";
import { cn } from "@/lib/cn";

interface StatItem {
  label: string;
  value: string;
  icon: typeof Target;
  color: string;
  bg: string;
}

interface SessionStatsCardsProps {
  sessions: Session[];
}

export function SessionStatsCards({ sessions }: SessionStatsCardsProps) {
  const workSessions = sessions.filter((s) => s.phase === "work");
  const totalFocusSec = workSessions.reduce(
    (acc, s) => acc + s.duration_sec,
    0,
  );
  const totalBreakSec = sessions
    .filter((s) => s.phase !== "work")
    .reduce((acc, s) => acc + s.duration_sec, 0);
  const avgSessionLength =
    workSessions.length > 0
      ? Math.round(totalFocusSec / workSessions.length)
      : 0;

  const stats: StatItem[] = [
    {
      label: "Focus Time",
      value: formatTotalTime(totalFocusSec),
      icon: Target,
      color: "text-sahara-primary",
      bg: "bg-sahara-primary/10",
    },
    {
      label: "Sessions",
      value: String(workSessions.length),
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Avg Length",
      value: formatDuration(avgSessionLength),
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Break Time",
      value: formatTotalTime(totalBreakSec),
      icon: Zap,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col items-center p-4 rounded-xl border border-sahara-border/15 bg-white",
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center mb-2",
                stat.bg,
              )}
            >
              <Icon className={cn("w-4.5 h-4.5", stat.color)} />
            </div>
            <p className={cn("text-lg font-bold tabular-nums", stat.color)}>
              {stat.value}
            </p>
            <p className="text-[10px] font-medium text-sahara-text-muted uppercase tracking-wider mt-0.5">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
