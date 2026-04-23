import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarWeekNavProps {
  weekStart: Date;
  weekEnd: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDateRange(start: Date, end: Date): string {
  const sDay = start.getDate();
  const eDay = end.getDate();
  const month = MONTHS[start.getMonth()];
  const year = start.getFullYear();
  if (sDay === eDay) return `${month} ${sDay}, ${year}`;
  if (start.getMonth() === end.getMonth())
    return `${month} ${sDay} – ${eDay}, ${year}`;
  return `${MONTHS[start.getMonth()]} ${sDay} – ${MONTHS[end.getMonth()]} ${eDay}, ${year}`;
}

export function CalendarWeekNav({
  weekStart,
  weekEnd,
  onPrev,
  onNext,
  onToday,
}: CalendarWeekNavProps) {
  const now = new Date();
  const isCurrentWeek = now >= weekStart && now <= weekEnd;

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon-lg"
        intent="default"
        shape="rounded-full"
        onClick={onPrev}
        title="Previous week"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {!isCurrentWeek && (
        <Button
          variant="ghost"
          size="xs"
          intent="sahara"
          shape="rounded-lg"
          className="text-[11px] font-semibold"
          onClick={onToday}
        >
          Today
        </Button>
      )}

      <span className="text-sm font-medium text-sahara-text min-w-45 text-center">
        {formatDateRange(weekStart, weekEnd)}
      </span>

      <Button
        variant="ghost"
        size="icon-lg"
        intent="default"
        shape="rounded-full"
        onClick={onNext}
        title="Next week"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
