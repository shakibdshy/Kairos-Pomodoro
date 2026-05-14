import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/db";
import { formatTimeAmPm } from "@/lib/time";
import type { SessionMood } from "@/features/timer/timer-types";
export type { SessionMood } from "@/features/timer/timer-types";
import { ModalOverlay } from "@/components/ui/modal-overlay";

interface MoodOption {
  id: SessionMood;
  emoji: string;
  label: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { id: "distracted", emoji: "😔", label: "Distracted" },
  { id: "neutral", emoji: "😊", label: "Neutral" },
  { id: "focused", emoji: "🤩", label: "Focused" },
];

interface FinishSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { mood: SessionMood; notes: string }) => void;
  category: Category | null;
  durationMinutes: number;
}

function formatTimeRange(durationMin: number): string {
  const now = new Date();
  const start = new Date(now.getTime() - durationMin * 60000);
  return `${formatTimeAmPm(start)} ${String.fromCharCode(8594)} ${formatTimeAmPm(now)}`;
}

export function FinishSessionModal({
  open,
  onClose,
  onSubmit,
  category,
  durationMinutes,
}: FinishSessionModalProps) {
  const [mood, setMood] = useState<SessionMood>("neutral");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit({ mood, notes });
    setNotes("");
    setMood("neutral");
  };

  return (
    <ModalOverlay
      open={open}
      onClose={onClose}
      backdropClassName="bg-sahara-text/25"
    >
      <Button
        variant="ghost"
        size="icon-lg"
        intent="default"
        shape="rounded-lg"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-sahara-text-muted hover:text-sahara-text hover:bg-sahara-bg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </Button>

      <div className="px-8 pt-8 pb-6 space-y-7">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <p className="text-[11px] font-bold text-sahara-text-muted uppercase tracking-[0.2em]">
            Let&apos;s pause and reflect.
          </p>
          <h2 className="font-serif text-2xl text-sahara-text font-semibold leading-snug">
            What have you learned in this Session?
          </h2>
        </div>

        {/* Mood Picker */}
        <div className="flex justify-center gap-4 pt-1">
          {MOOD_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              variant="outline"
              intent="default"
              size="md"
              shape="rounded-2xl"
              active={mood === opt.id}
              onClick={() => setMood(opt.id)}
              className={cn(
                "flex-col gap-2 px-5 py-4",
                mood === opt.id
                  ? "scale-105"
                  : "border-transparent hover:bg-sahara-card/50",
              )}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span
                className={cn(
                  "text-xs font-bold tracking-wider uppercase flex items-center gap-1",
                  mood === opt.id
                    ? "text-sahara-text"
                    : "text-sahara-text-muted",
                )}
              >
                {opt.label}
                {opt.id === "distracted" && (
                  <span className="text-[10px]">&darr;</span>
                )}
                {opt.id === "neutral" && <ArrowRight className="w-3 h-3" />}
                {opt.id === "focused" && (
                  <span className="text-[10px]">&uarr;</span>
                )}
              </span>
            </Button>
          ))}
        </div>

        {/* Details Rows */}
        <div className="space-y-0 divide-y divide-sahara-border/15">
          {/* Category */}
          <div className="flex items-center py-3.5">
            <span className="w-24 shrink-0 text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider">
              Category
            </span>
            {category ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sahara-border/20 bg-sahara-surface">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span
                  className="text-xs font-bold"
                  style={{ color: category.color }}
                >
                  {category.name}
                </span>
              </div>
            ) : (
              <span className="text-sm text-sahara-text-muted italic">
                No category
              </span>
            )}
          </div>

          {/* Intent */}
          <div className="flex items-center py-3.5">
            <span className="w-24 shrink-0 text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider">
              Intent
            </span>
            <span className="text-sm text-sahara-text-secondary">
              {category?.name || "—"}
            </span>
          </div>

          {/* Focus Duration */}
          <div className="flex items-center py-3.5">
            <span className="w-24 shrink-0 text-[11px] font-bold text-sahara-text-muted uppercase tracking-wider">
              Focus
            </span>
            <span className="text-sm font-medium text-sahara-text tabular-nums">
              {durationMinutes}min
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-sahara-text-muted ml-auto opacity-40" />
          </div>
        </div>

        {/* Time Range Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-sahara-border/30 bg-sahara-bg/30">
            <span className="text-sm font-semibold text-sahara-text tabular-nums tracking-wide">
              {formatTimeRange(durationMinutes)}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write down your learning or distraction in this session..."
            rows={3}
            className="w-full px-4 py-3 bg-sahara-bg/40 border border-sahara-border/20 rounded-xl text-sm text-sahara-text placeholder:text-sahara-text-muted/50 focus:outline-none focus:border-sahara-primary/50 focus:ring-2 focus:ring-sahara-primary/10 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <Button
          variant="solid"
          intent="green"
          fullWidth
          shape="rounded-2xl"
          onClick={handleSubmit}
        >
          Submit Session
        </Button>
      </div>
    </ModalOverlay>
  );
}
