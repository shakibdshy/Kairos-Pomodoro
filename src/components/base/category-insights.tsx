import { useEffect, useState } from "react";
import { BarChart3, Clock3, Loader2, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryAnalytics, type CategoryAnalytics } from "@/lib/db";
import { formatDuration, formatTotalTime } from "@/lib/session-utils";
import { cn } from "@/lib/cn";

interface CategoryInsightsProps {
  startDate: string;
  endDate: string;
}

type Scope = "period" | "allTime";

export function CategoryInsights({ startDate, endDate }: CategoryInsightsProps) {
  const [scope, setScope] = useState<Scope>("period");
  const [categories, setCategories] = useState<CategoryAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  const requestScope = scope === "allTime" ? "allTime" : `${startDate}:${endDate}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const request = scope === "allTime"
      ? getCategoryAnalytics()
      : getCategoryAnalytics(startDate, endDate);

    request
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestScope, scope]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-sahara-text-muted">
          Focus time, sessions, and averages grouped by category.
        </p>
        <div className="flex rounded-full border border-sahara-border/25 bg-sahara-card/50 p-1">
          {(["period", "allTime"] as const).map((value) => (
            <Button
              key={value}
              variant="ghost"
              size="xs"
              shape="rounded-full"
              intent="default"
              active={scope === value}
              onClick={() => setScope(value)}
              className={cn(
                "px-3 py-1.5 text-[9px] tracking-[0.14em]",
                scope === value && "bg-sahara-primary-light text-sahara-primary",
              )}
            >
              {value === "period" ? "Selected Period" : "All Time"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-32 items-center justify-center rounded-2xl border border-sahara-border/20 bg-sahara-surface">
          <Loader2 className="size-5 animate-spin text-sahara-primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sahara-border/30 bg-sahara-surface px-5 py-10 text-center">
          <p className="text-sm font-semibold text-sahara-text">No category focus yet</p>
          <p className="mt-1 text-xs text-sahara-text-muted">Assign a category to your next focus session.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <CategoryMetricCard key={category.category_id ?? "uncategorized"} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryMetricCard({ category }: { category: CategoryAnalytics }) {
  const metrics = [
    {
      label: "Focus",
      icon: Clock3,
      value: formatTotalTime(category.total_focus_seconds),
    },
    {
      label: "Sessions",
      icon: Target,
      value: String(category.session_count),
    },
    {
      label: "Avg Session",
      icon: TrendingUp,
      value: category.avg_session_seconds > 0 ? formatDuration(category.avg_session_seconds) : "0m",
    },
    {
      label: "Daily Avg",
      icon: BarChart3,
      value: category.daily_avg_seconds > 0 ? formatTotalTime(category.daily_avg_seconds) : "0m",
    },
  ];

  return (
    <div className="group overflow-hidden rounded-2xl border border-sahara-border/20 bg-sahara-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-sahara-primary/35 hover:shadow-lg hover:shadow-sahara-primary/5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="size-3 shrink-0 rounded-full ring-4 ring-current/10"
            style={{ color: category.category_color, backgroundColor: category.category_color }}
          />
          <h3 className="truncate text-sm font-bold text-sahara-text">{category.category_name}</h3>
        </div>
        <span className="shrink-0 text-[10px] font-black tabular-nums text-sahara-primary">
          {category.percentage_of_focus}%
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl bg-sahara-bg/45 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-sahara-text-muted">
                <Icon className="size-3" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{metric.label}</span>
              </div>
              <p className="mt-1 text-sm font-black tabular-nums text-sahara-text">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sahara-bg/70">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(category.percentage_of_focus, 2)}%`, backgroundColor: category.category_color }}
        />
      </div>
    </div>
  );
}
