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
      color: "text-[#c2652a]",
      bg: "bg-[#c2652a]/15",
    },
    {
      label: "Sessions",
      value: String(workSessions.length),
      icon: CheckCircle2,
      color: "text-[#6b9080]",
      bg: "bg-[#6b9080]/15",
    },
    {
      label: "Avg Length",
      value: formatDuration(avgSessionLength),
      icon: TrendingUp,
      color: "text-[#c4956a]",
      bg: "bg-[#c4956a]/15",
    },
    {
      label: "Break Time",
      value: formatTotalTime(totalBreakSec),
      icon: Zap,
      color: "text-[#c45c4a]",
      bg: "bg-[#c45c4a]/15",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col items-center p-3 md:p-4 lg:p-3 rounded-xl border border-sahara-border/15 bg-sahara-surface",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 md:w-9 md:h-9 lg:w-9 lg:h-9 rounded-full flex items-center justify-center mb-1.5 md:mb-2 lg:mb-1.5",
                stat.bg,
              )}
            >
              <Icon className={cn("w-3.5 h-3.5 md:w-4.5 md:h-4.5 lg:w-4.5 lg:h-4.5", stat.color)} />
            </div>
            <p className="text-base md:text-lg lg:text-base font-bold tabular-nums text-sahara-text">
              {stat.value}
            </p>
            <p className="text-[9px] md:text-[10px] lg:text-[10px] font-medium text-sahara-text-muted uppercase tracking-wider mt-0.5">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
