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
      <button
        onClick={onPrev}
        className="w-8 h-8 flex items-center justify-center rounded-full text-sahara-text-muted hover:text-sahara-primary hover:bg-sahara-bg transition-colors cursor-pointer"
        title="Previous week"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {!isCurrentWeek && (
        <button
          onClick={onToday}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-sahara-primary hover:bg-sahara-primary-light transition-colors cursor-pointer"
        >
          Today
        </button>
      )}

      <span className="text-sm font-medium text-sahara-text min-w-45 text-center">
        {formatDateRange(weekStart, weekEnd)}
      </span>

      <button
        onClick={onNext}
        className="w-8 h-8 flex items-center justify-center rounded-full text-sahara-text-muted hover:text-sahara-primary hover:bg-sahara-bg transition-colors cursor-pointer"
        title="Next week"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
