import type { CategoryBreakdown } from "@/lib/db";
import { formatTotalTime } from "@/lib/session-utils";
import { cn } from "@/lib/cn";

interface CategoryBreakdownProps {
  breakdowns: CategoryBreakdown[];
}

export function CategoryBreakdown({ breakdowns }: CategoryBreakdownProps) {
  if (breakdowns.length === 0) return null;

  const maxSeconds = Math.max(...breakdowns.map((b) => b.total_seconds), 1);

  return (
    <div className="space-y-2">
      {breakdowns.map((item) => {
        const percentage = Math.round((item.total_seconds / maxSeconds) * 100);
        const label = item.category_name || item.intention || "Uncategorized";
        const color = item.category_color || "#94a3b8";

        return (
          <div key={`${item.category_id}-${item.intention}`} className="group">
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-sahara-text truncate">
                  {label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-xs font-bold text-sahara-text-secondary tabular-nums">
                  {formatTotalTime(item.total_seconds)}
                </span>
                <span className="text-[10px] font-bold text-sahara-text-muted tabular-nums bg-sahara-bg/50 px-1.5 py-0.5 rounded">
                  {item.session_count}{item.session_count === 1 ? " session" : " sessions"}
                </span>
              </div>
            </div>
            <div className="h-2 bg-sahara-bg/40 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  "group-hover:brightness-110"
                )}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
