import { useState, useEffect } from "react";
import { getMoodDistribution, type MoodStat } from "@/lib/db";
import { cn } from "@/lib/cn";

const MOOD_META: Record<string, { emoji: string; label: string; color: string }> = {
  distracted: { emoji: "😔", label: "Distracted", color: "#f87171" },
  neutral: { emoji: "😊", label: "Neutral", color: "#facc15" },
  focused: { emoji: "🤩", label: "Focused", color: "#4ade80" },
};

interface MoodDistributionProps {
  startDate?: string;
  endDate?: string;
}

export function MoodDistribution({ startDate, endDate }: MoodDistributionProps) {
  const [moods, setMoods] = useState<MoodStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMoodDistribution(startDate, endDate)
      .then(setMoods)
      .catch(() => setMoods([]))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
        <p className="text-[15px] text-sahara-text-muted">Loading...</p>
      </div>
    );
  }

  const totalMoods = moods.reduce((s, m) => s + m.count, 0);
  const maxCount = Math.max(...moods.map((m) => m.count), 1);

  return (
    <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
      {/* <h3 className="text-xs md:text-sm font-bold text-sahara-text-muted uppercase tracking-wider mb-4 md:mb-5">
        Mood Distribution
      </h3> */}

      {moods.length === 0 ? (
        <p className="text-[15px] text-sahara-text-muted text-center py-6">
          No mood data yet
        </p>
      ) : (
        <div className="space-y-6.5">
          {moods.map((m) => {
            const meta = MOOD_META[m.mood] ?? {
              emoji: "❓",
              label: m.mood,
              color: "#94a3b8",
            };
            const percentage = totalMoods > 0 ? Math.round((m.count / totalMoods) * 100) : 0;
            const barWidth = Math.round((m.count / maxCount) * 100);

            return (
              <div key={m.mood} className="group">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta.emoji}</span>
                    <span className="text-[17px] font-semibold text-sahara-text">
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-sahara-text-secondary tabular-nums">
                      {m.count}{m.count === 1 ? " session" : " sessions"}
                    </span>
                    <span className="text-xs font-bold text-sahara-text-muted tabular-nums bg-sahara-bg/50 px-1.5 py-0.5 rounded">
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-sahara-bg/40 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      "group-hover:brightness-110",
                    )}
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalMoods > 0 && (
        <div className="mt-4 pt-3 border-t border-sahara-border/15 flex items-center justify-between">
          <span className="text-sm font-bold text-sahara-text-muted uppercase tracking-wider">
            Total Rated
          </span>
          <span className="text-[17px] font-bold text-sahara-text tabular-nums">
            {totalMoods} sessions
          </span>
        </div>
      )}
    </div>
  );
}
