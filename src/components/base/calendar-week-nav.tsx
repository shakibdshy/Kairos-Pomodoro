import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

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
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5 bg-white border border-sahara-border/20 rounded-xl px-1 py-1">
        <button
          onClick={onPrev}
          className="p-2 rounded-lg text-sahara-text-muted hover:text-sahara-primary hover:bg-sahara-bg/50 transition-colors"
          title="Previous week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {!isCurrentWeek && (
          <button
            onClick={onToday}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-sahara-primary hover:bg-sahara-primary-light transition-colors"
          >
            <CalendarDays className="w-3 h-3" />
            Today
          </button>
        )}
        <span className="text-xs font-bold text-sahara-text-secondary min-w-45 text-center">
          {formatDateRange(weekStart, weekEnd)}
        </span>
        <button
          onClick={onNext}
          className="p-2 rounded-lg text-sahara-text-muted hover:text-sahara-primary hover:bg-sahara-bg/50 transition-colors"
          title="Next week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
