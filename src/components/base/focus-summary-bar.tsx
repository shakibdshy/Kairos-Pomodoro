import { Clock, Target, Flame, Timer } from "lucide-react";
import type { Session } from "@/lib/session-utils";
import { formatTotalTime } from "@/lib/session-utils";
import { cn } from "@/lib/cn";

interface FocusSummaryBarProps {
  sessions: Session[];
  topCategory: { name: string; color: string; count: number } | null;
}

const ICON_STYLES = {
  clock: "bg-sahara-primary/10 text-sahara-primary",
  target: "bg-[#6b9080]/15 text-[#6b9080]",
  flame: "bg-[#c4956a]/15 text-[#c4956a]",
  timer: "bg-[#c45c4a]/15 text-[#c45c4a]",
} as const;

function StatBox({
  label,
  value,
  icon: Icon,
  styleKey,
  extra,
  iconColor,
}: {
  label: string;
  value: React.ReactNode;
  icon: any;
  styleKey: keyof typeof ICON_STYLES;
  extra?: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <div className="group relative bg-sahara-surface/40 backdrop-blur-md rounded-2xl border border-sahara-border/10 p-3.5 md:p-4 flex items-center gap-3.5 transition-all duration-300 hover:border-sahara-primary/30 hover:bg-sahara-surface/60 shadow-sm">
      <div
        className={cn(
          "size-10 md:size-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
          styleKey === "flame" && iconColor ? "" : ICON_STYLES[styleKey],
        )}
        style={
          styleKey === "flame" && iconColor
            ? { backgroundColor: `${iconColor}15`, color: iconColor }
            : {}
        }
      >
        <Icon className="size-5 md:size-5.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-sahara-text-muted uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <div className="flex flex-col">
          <p className="text-base md:text-lg font-black text-sahara-text truncate leading-tight">
            {value}
          </p>
          {extra && <div className="mt-1">{extra}</div>}
        </div>
      </div>
    </div>
  );
}

export function FocusSummaryBar({
  sessions,
  topCategory,
}: FocusSummaryBarProps) {
  const workSessions = sessions.filter((s) => s.phase === "work");
  const totalFocusSec = workSessions.reduce(
    (sum, s) => sum + s.duration_sec,
    0,
  );
  const sessionCount = workSessions.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatBox 
        label="Focus Time" 
        value={formatTotalTime(totalFocusSec)} 
        icon={Clock} 
        styleKey="clock" 
      />
      
      <StatBox 
        label="Sessions" 
        value={sessionCount} 
        icon={Target} 
        styleKey="target" 
      />

      <StatBox 
        label="Top Focus" 
        styleKey="flame"
        icon={Flame}
        iconColor={topCategory?.color}
        value={topCategory ? topCategory.name : "—"}
        extra={topCategory && (
          <div className="flex items-center gap-1">
             <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: topCategory.color }}
              />
              <span className="text-[9px] font-bold text-sahara-text-muted tabular-nums uppercase">
                {topCategory.count} Recorded
              </span>
          </div>
        )}
      />

      <StatBox 
        label="Avg Focus" 
        value={sessionCount > 0 ? formatTotalTime(Math.round(totalFocusSec / sessionCount)) : "0m"} 
        icon={Timer} 
        styleKey="timer" 
      />
    </div>
  );
}
