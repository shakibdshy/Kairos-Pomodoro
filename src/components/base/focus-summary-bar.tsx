import { Clock, Target, Flame, Timer } from "lucide-react";
import type { Session } from "@/lib/session-utils";
import { formatTotalTime } from "@/lib/session-utils";

interface FocusSummaryBarProps {
  sessions: Session[];
  topCategory: { name: string; color: string; count: number } | null;
}

const ICON_STYLES = {
  clock: "bg-[#c2652a]/15 text-[#c2652a]",
  target: "bg-[#6b9080]/15 text-[#6b9080]",
  flame: "bg-[#c4956a]/15 text-[#c4956a]",
  timer: "bg-[#c45c4a]/15 text-[#c45c4a]",
} as const;

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* Focus Time */}
      <div className="bg-sahara-surface rounded-xl border border-sahara-border/15 p-3 md:p-4 lg:p-3.5 flex items-center gap-2.5 md:gap-3 lg:gap-2.5">
        <div className={`w-9 h-9 md:w-10 md:h-10 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center shrink-0 ${ICON_STYLES.clock}`}>
          <Clock className="w-4 h-4 md:w-5 md:h-5 lg:w-4.5 lg:h-4.5" />
        </div>
        <div>
          <p className="text-[10px] md:text-xs lg:text-[10px] font-bold text-sahara-text-muted uppercase tracking-wider">
            Focus Time
          </p>
          <p className="text-base md:text-lg lg:text-base font-bold text-sahara-text tabular-nums">
            {formatTotalTime(totalFocusSec)}
          </p>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-sahara-surface rounded-xl border border-sahara-border/15 p-3 md:p-4 lg:p-3.5 flex items-center gap-2.5 md:gap-3 lg:gap-2.5">
        <div className={`w-9 h-9 md:w-10 md:h-10 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center shrink-0 ${ICON_STYLES.target}`}>
          <Target className="w-4 h-4 md:w-5 md:h-5 lg:w-4.5 lg:h-4.5" />
        </div>
        <div>
          <p className="text-[10px] md:text-xs lg:text-[10px] font-bold text-sahara-text-muted uppercase tracking-wider">
            Sessions
          </p>
          <p className="text-base md:text-lg lg:text-base font-bold text-sahara-text tabular-nums">
            {sessionCount}
          </p>
        </div>
      </div>

      {/* Top Category */}
      <div className="bg-sahara-surface rounded-xl border border-sahara-border/15 p-3 md:p-4 lg:p-3.5 flex items-center gap-2.5 md:gap-3 lg:gap-2.5">
        <div className={`w-9 h-9 md:w-10 md:h-10 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center shrink-0 ${ICON_STYLES.flame}`}>
          <Flame className="w-4 h-4 md:w-5 md:h-5 lg:w-4.5 lg:h-4.5" />
        </div>
        <div>
          <p className="text-[10px] md:text-xs lg:text-[10px] font-bold text-sahara-text-muted uppercase tracking-wider">
            Top Category
          </p>
          {topCategory ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: topCategory.color }}
              />
              <span className="text-sm md:text-base lg:text-sm font-bold text-sahara-text truncate max-w-16 md:max-w-none lg:max-w-20">
                {topCategory.name}
              </span>
              <span className="text-[10px] text-sahara-text-muted tabular-nums">
                ×{topCategory.count}
              </span>
            </div>
          ) : (
            <p className="text-sm md:text-base lg:text-sm font-bold text-sahara-text-muted mt-0.5">
              —
            </p>
          )}
        </div>
      </div>

      {/* Avg Focus */}
      <div className="bg-sahara-surface rounded-xl border border-sahara-border/15 p-3 md:p-4 lg:p-3.5 flex items-center gap-2.5 md:gap-3 lg:gap-2.5">
        <div className={`w-9 h-9 md:w-10 md:h-10 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center shrink-0 ${ICON_STYLES.timer}`}>
          <Timer className="w-4 h-4 md:w-5 md:h-5 lg:w-4.5 lg:h-4.5" />
        </div>
        <div>
          <p className="text-[10px] md:text-xs lg:text-[10px] font-bold text-sahara-text-muted uppercase tracking-wider">
            Avg Focus
          </p>
          <p className="text-base md:text-lg lg:text-base font-bold text-sahara-text tabular-nums">
            {sessionCount > 0
              ? formatTotalTime(
                  Math.round(totalFocusSec / sessionCount),
                )
              : "0m"}
          </p>
        </div>
      </div>
    </div>
  );
}
