import { Clock, Target, Flame, Timer } from "lucide-react";
import type { Session } from "@/lib/session-utils";
import { formatTotalTime } from "@/lib/session-utils";

interface FocusSummaryBarProps {
  sessions: Session[];
  topCategory: { name: string; color: string; count: number } | null;
}

export function FocusSummaryBar({ sessions, topCategory }: FocusSummaryBarProps) {
  const workSessions = sessions.filter((s) => s.phase === "work");
  const totalFocusSec = workSessions.reduce((sum, s) => sum + s.duration_sec, 0);
  const sessionCount = workSessions.length;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-sahara-border/15 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sahara-primary-light/60 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-sahara-primary" />
        </div>
        <div>
          <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">Focus Time</p>
          <p className="text-lg font-bold text-sahara-text tabular-nums">
            {formatTotalTime(totalFocusSec)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-sahara-border/15 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">Sessions</p>
          <p className="text-lg font-bold text-sahara-text tabular-nums">{sessionCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-sahara-border/15 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">Top Category</p>
          {topCategory ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: topCategory.color }}
              />
              <span className="text-sm font-bold text-sahara-text truncate max-w-[100px]">
                {topCategory.name}
              </span>
            </div>
          ) : (
            <p className="text-sm font-bold text-sahara-text-muted">—</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-sahara-border/15 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
          <Timer className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-sahara-text-muted uppercase tracking-wider">Avg Length</p>
          <p className="text-lg font-bold text-sahara-text tabular-nums">
            {sessionCount > 0
              ? formatTotalTime(Math.round(totalFocusSec / sessionCount))
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
