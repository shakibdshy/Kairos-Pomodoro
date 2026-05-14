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
      bg: "bg-[#c2652a]/10",
    },
    {
      label: "Sessions",
      value: String(workSessions.length),
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Avg Length",
      value: formatDuration(avgSessionLength),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "Break Time",
      value: formatTotalTime(totalBreakSec),
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              "group relative flex flex-col items-center p-4 md:p-5 lg:p-4 rounded-2xl border border-sahara-border/15 bg-sahara-surface/60 backdrop-blur-sm transition-all duration-300 hover:border-sahara-primary/30 hover:shadow-lg hover:shadow-sahara-primary/5",
            )}
          >
            <div
              className={cn(
                "size-10 md:w-12 md:h-12 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center mb-2.5 md:mb-3 lg:mb-2.5 transition-transform duration-300 group-hover:scale-110 shadow-sm",
                stat.bg,
              )}
            >
              <Icon className={cn("size-5 md:w-6 md:h-6 lg:w-5.5 lg:h-5.5", stat.color)} />
            </div>
            <p className="text-lg md:text-xl lg:text-lg font-black tabular-nums text-sahara-text tracking-tight">
              {stat.value}
            </p>
            <p className="text-[10px] md:text-xs lg:text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest mt-1">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
