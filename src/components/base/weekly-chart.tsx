import { cn } from "@/lib/cn";

interface WeekPoint {
  day_name: string;
  focus_seconds: number;
}

interface WeeklyChartProps {
  data: WeekPoint[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxVal = Math.max(...data.map((d) => d.focus_seconds), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 md:gap-3 h-36 md:h-44">
        {data.map((point, i) => {
          const pct = (point.focus_seconds / maxVal) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1.5 md:gap-2"
            >
              <span className="text-[9px] md:text-[10px] font-bold text-sahara-text-muted tabular-nums leading-none">
                {Math.round(point.focus_seconds / 60)}m
              </span>
              <div className="w-full flex-1 relative min-h-0">
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-500",
                    point.focus_seconds > 0
                      ? "bg-sahara-primary"
                      : "bg-sahara-border/20",
                  )}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[9px] md:text-[10px] font-semibold text-sahara-text-muted uppercase tracking-wider shrink-0 mt-auto">
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
