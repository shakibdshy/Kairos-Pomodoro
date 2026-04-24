import { useState, useEffect } from "react";
import { getCategoryBreakdown, type CategoryBreakdown } from "@/lib/db";

export function AnalyticsCategoryBreakdown() {
  const [breakdowns, setBreakdowns] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategoryBreakdown()
      .then(setBreakdowns)
      .catch(() => setBreakdowns([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
        <p className="text-xs text-sahara-text-muted">Loading...</p>
      </div>
    );
  }

  const totalSec = breakdowns.reduce((sum, b) => sum + b.total_seconds, 0) || 1;

  return (
    <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
      <h3 className="text-[10px] md:text-xs font-bold text-sahara-text-muted uppercase tracking-wider mb-3 md:mb-4">
        Time by Category
      </h3>
      <div className="space-y-3">
        {breakdowns.map((b) => {
          const pct = (b.total_seconds / totalSec) * 100;
          return (
            <div key={b.intention || b.category_id || Math.random()} className="flex items-center gap-2.5 md:gap-3">
              <span
                className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: b.category_color || "#c2652a" }}
              />
              <span className="text-[11px] md:text-sm font-semibold text-sahara-text w-24 md:w-32 truncate shrink-0">
                {b.intention || b.category_name || "Uncategorized"}
              </span>
              <div className="flex-1 h-2 bg-sahara-bg/60 rounded-full overflow-hidden min-w-0">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    backgroundColor: b.category_color || "#c2652a",
                  }}
                />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-sahara-text-secondary tabular-nums w-14 text-right shrink-0">
                {Math.round(pct)}%
              </span>
            </div>
          );
        })}
      </div>

      {breakdowns.length === 0 && (
        <p className="text-sm text-sahara-text-muted text-center py-6">
          No category data yet
        </p>
      )}
    </div>
  );
}
