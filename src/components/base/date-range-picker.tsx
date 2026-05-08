import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type DatePeriod, PERIOD_OPTIONS } from "@/lib/date-range";

interface DateRangePickerProps {
  value: DatePeriod;
  onChange: (period: DatePeriod) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeLabel =
    PERIOD_OPTIONS.find((o) => o.value === value)?.label ?? "Last 7 Days";

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("app:escape", handler);
    return () => window.removeEventListener("app:escape", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        intent="default"
        size="sm"
        className="gap-1.5 text-xs font-medium"
        onClick={() => setOpen(!open)}
      >
        {activeLabel}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-sahara-surface border border-sahara-border/20 rounded-xl shadow-lg p-1 w-36 animate-in fade-in slide-in-from-top-2 duration-150">
            {PERIOD_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant="ghost"
                size="xs"
                fullWidth
                intent="default"
                active={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="text-xs md:text-base font-medium"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
