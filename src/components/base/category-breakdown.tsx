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
    <div className="space-y-6 md:space-y-7">
      {breakdowns.map((item) => {
        const percentage = Math.round((item.total_seconds / maxSeconds) * 100);
        const label = item.category_name || item.intention || "Uncategorized";
        const color = item.category_color || "#94a3b8";

        return (
          <div key={`${item.category_id}-${item.intention}`} className="group relative">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className="size-2.5 rounded-full ring-offset-0 transition-all duration-300 group-hover:scale-125"
                  style={{ 
                    backgroundColor: color, 
                    boxShadow: `0 0 0 4px ${color}20` 
                  }}
                />
                <span className="text-sm md:text-base font-bold text-sahara-text truncate tracking-tight">
                  {label}
                </span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 ml-4">
                <span className="text-sm md:text-base font-black text-sahara-text-secondary tabular-nums">
                  {formatTotalTime(item.total_seconds)}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-sahara-card/80 text-[10px] font-bold text-sahara-text-muted uppercase tracking-wider border border-sahara-border/10">
                  {item.session_count} {item.session_count === 1 ? "Session" : "Sessions"}
                </span>
              </div>
            </div>
            
            <div className="relative h-2.5 w-full bg-sahara-bg/50 rounded-full overflow-hidden border border-sahara-border/5">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out relative",
                  "group-hover:brightness-110 shadow-[0_0_10px_rgba(0,0,0,0.05)]"
                )}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              >
                {/* Subtle glow effect */}
                <div 
                  className="absolute inset-0 opacity-20 bg-white"
                  style={{ 
                    maskImage: 'linear-gradient(to right, transparent, white, transparent)',
                    maskSize: '200% 100%',
                    animation: 'shimmer 800ms infinite linear'
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
