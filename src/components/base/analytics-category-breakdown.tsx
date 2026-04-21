import type { CategoryBreakdown } from "@/lib/db";
import { formatTotalTime } from "@/lib/session-utils";

interface AnalyticsCategoryBreakdownProps {
  breakdowns: CategoryBreakdown[];
  title?: string;
}

export function AnalyticsCategoryBreakdown({
  breakdowns,
  title = "Time by Category",
}: AnalyticsCategoryBreakdownProps) {
  if (breakdowns.length === 0) {
    return (
      <div className="bg-sahara-surface border border-sahara-border/20 rounded-3xl p-8 shadow-sm shadow-sahara-primary/5">
        <h3 className="font-serif text-2xl text-sahara-text mb-6">{title}</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-sahara-text-muted">
            Complete some sessions to see your category breakdown here.
          </p>
        </div>
      </div>
    );
  }

  const totalSeconds = breakdowns.reduce((sum, b) => sum + b.total_seconds, 0);

  return (
    <div className="bg-sahara-surface border border-sahara-border/20 rounded-3xl p-8 shadow-sm shadow-sahara-primary/5">
      <h3 className="font-serif text-2xl text-sahara-text mb-6">{title}</h3>

      <div className="space-y-4">
        {breakdowns.slice(0, 6).map((item) => {
          const pct =
            totalSeconds > 0
              ? Math.round((item.total_seconds / totalSeconds) * 100)
              : 0;
          const label = item.category_name || item.intention || "Uncategorized";
          const color = item.category_color || "#94a3b8";

          return (
            <div
              key={`${item.category_id}-${item.intention}`}
              className="group"
            >
              <div className="flex items-center justify-between mb-1.5 px-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 0 2px ${color}40`,
                    }}
                  />
                  <span className="text-sm font-semibold text-sahara-text truncate">
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-sm font-bold text-sahara-text-secondary tabular-nums">
                    {formatTotalTime(item.total_seconds)}
                  </span>
                  <span className="text-xs font-bold text-sahara-text-muted tabular-nums bg-sahara-bg/50 px-2 py-0.5 rounded-md">
                    {pct}%
                  </span>
                  <span className="text-[11px] font-medium text-sahara-text-muted/70 tabular-nums">
                    {item.session_count} session
                    {item.session_count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="h-2.5 bg-sahara-bg/40 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {breakdowns.length > 6 && (
        <p className="text-xs text-sahara-text-muted mt-4 text-center italic">
          +{breakdowns.length - 6} more categories
        </p>
      )}
    </div>
  );
}
