import { useState, useEffect } from "react";
import { getCategoryBreakdown, type CategoryBreakdown } from "@/lib/db";
import { CategoryBreakdown as CategoryBreakdownBars } from "@/components/base/category-breakdown";

interface AnalyticsCategoryBreakdownProps {
  startDate?: string;
  endDate?: string;
}

export function AnalyticsCategoryBreakdown({ startDate, endDate }: AnalyticsCategoryBreakdownProps) {
  const [breakdowns, setBreakdowns] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCategoryBreakdown(startDate, endDate)
      .then(setBreakdowns)
      .catch(() => setBreakdowns([]))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
        <p className="text-xs text-sahara-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-sahara-surface border border-sahara-border/20 rounded-xl md:rounded-2xl p-3.5 md:p-5">
      {/* <h3 className="text-xs md:text-sm font-bold text-sahara-text-muted uppercase tracking-wider mb-3 md:mb-4">
        Time by Category
      </h3> */}
      <CategoryBreakdownBars breakdowns={breakdowns} />
      {breakdowns.length === 0 && (
        <p className="text-[15px] text-sahara-text-muted text-center py-6">
          No category data yet
        </p>
      )}
    </div>
  );
}
