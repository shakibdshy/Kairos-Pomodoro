import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarWeekNavProps {
  weekStart: Date;
  weekEnd: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarWeekNav({
  weekStart,
  weekEnd,
  onPrev,
  onNext,
  onToday,
}: CalendarWeekNavProps) {
  const formatRange = (start: Date, end: Date) => {
    const s = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const e = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: start.getFullYear() !== end.getFullYear() ? "numeric" : undefined,
    });
    return `${s} – ${e}`;
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Button
        variant="outline"
        size="icon"
        intent="default"
        shape="rounded-full"
        onClick={onPrev}
        className="border-sahara-border/30"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="text-center min-w-30 sm:min-w-40">
        <p className="text-xs md:text-sm font-bold text-sahara-text tabular-nums">
          {formatRange(weekStart, weekEnd)}
        </p>
      </div>

      <Button
        variant="outline"
        size="icon"
        intent="default"
        shape="rounded-full"
        onClick={onNext}
        className="border-sahara-border/30"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        intent="default"
        onClick={onToday}
        className="ml-1 text-[10px] md:text-xs font-bold tracking-wider uppercase text-sahara-primary hover:text-sahara-primary/80"
      >
        Today
      </Button>
    </div>
  );
}
