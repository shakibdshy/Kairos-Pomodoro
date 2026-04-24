import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

interface CalendarDayPillProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarDayPill({
  date,
  isSelected,
  isToday,
  onClick,
}: CalendarDayPillProps) {
  const dayOfWeek = date.getDay();

  return (
    <Button
      variant={isSelected ? "solid" : "ghost"}
      intent={isSelected || isToday ? "sahara" : "default"}
      size="icon-lg"
      shape="rounded-xl"
      fullWidth
      onClick={onClick}
      className={cn(
        "flex-col gap-0.5 py-2 h-auto",
        !isSelected && !isToday && "text-sahara-text-muted",
        isToday && !isSelected && "text-sahara-primary font-semibold",
      )}
    >
      <span
        className={cn(
          "text-[9px] font-semibold uppercase tracking-wider leading-none",
          isSelected ? "text-white/80" : "",
        )}
      >
        {DAY_LABELS[dayOfWeek]}
      </span>
      <span
        className={cn(
          "font-serif text-base leading-none font-bold",
          isSelected ? "text-white" : "",
        )}
      >
        {date.getDate()}
      </span>
    </Button>
  );
}
