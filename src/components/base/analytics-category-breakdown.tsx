import { useState, useEffect } from "react";
import { getCategoryBreakdown, type CategoryBreakdown } from "@/lib/db";
import { CategoryBreakdown as CategoryBreakdownBars } from "@/components/base/category-breakdown";

interface AnalyticsCategoryBreakdownProps {
  startDate?: string;
  endDate?: string;
}

export function AnalyticsCategoryBreakdown({
  startDate,
  endDate,
}: AnalyticsCategoryBreakdownProps) {
  const [breakdowns, setBreakdowns] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Changing the range replaces this effect while the previous request may
    // still be in flight. Without this guard the stale response can overwrite
    // the current range's data, and its `finally` can clear `loading` while the
    // newer request is still running.
    let obsolete = false;
    setLoading(true);
    getCategoryBreakdown(startDate, endDate)
      .then((rows) => {
        if (!obsolete) setBreakdowns(rows);
      })
      .catch(() => {
        if (!obsolete) setBreakdowns([]);
      })
      .finally(() => {
        if (!obsolete) setLoading(false);
      });
    return () => {
      obsolete = true;
    };
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
        <p className="text-xs text-sahara-text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
      <CategoryBreakdownBars breakdowns={breakdowns} />
      {breakdowns.length === 0 && (
        <p className="text-[15px] text-sahara-text-muted text-center py-6">
          No category data yet
        </p>
      )}
    </div>
  );
}
