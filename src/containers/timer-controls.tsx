import { useTimerStore } from "@/features/timer/use-timer-store";
import { TimerDisplay } from "@/base/timer-display";
import { RotateCcw, Play, Pause, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TimerPhase } from "@/features/timer/timer-types";

export function TimerControls() {
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const reset = useTimerStore((s) => s.reset);
  const setPhase = useTimerStore((s) => s.setPhase);

  const phases: { id: TimerPhase; label: string }[] = [
    { id: "work", label: "Work" },
    { id: "short_break", label: "Short Break" },
    { id: "long_break", label: "Long Break" },
  ];

  return (
    <div className="flex flex-col items-center gap-12">
      {/* Phase Selector */}
      <div className="flex bg-sahara-card p-1 rounded-full border border-sahara-border/20">
        {phases.map((p) => (
          <button
            key={p.id}
            onClick={() => setPhase(p.id)}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold tracking-wider transition-all",
              phase === p.id
                ? "bg-white text-sahara-primary shadow-sm"
                : "text-sahara-text-muted hover:text-sahara-text-secondary",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <TimerDisplay
        secondsRemaining={secondsRemaining}
        totalSeconds={totalSeconds}
        phase={phase}
      />

      <div className="flex items-center gap-8">
        <button
          onClick={reset}
          className="p-4 rounded-full border border-sahara-border/30 text-sahara-text-secondary hover:bg-sahara-card transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {status === "running" ? (
          <button
            onClick={pause}
            className="flex items-center gap-3 bg-sahara-primary text-white px-8 py-4 rounded-full font-bold text-xs tracking-widest hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20"
          >
            <Pause className="w-4 h-4 fill-current" />
            PAUSE FOCUS
          </button>
        ) : (
          <button
            onClick={status === "paused" ? resume : () => start()}
            className="flex items-center gap-3 bg-sahara-primary text-white px-8 py-4 rounded-full font-bold text-xs tracking-widest hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20"
          >
            <Play className="w-4 h-4 fill-current ml-1" />
            START FOCUS
          </button>
        )}

        <button className="p-4 rounded-full border border-sahara-border/30 text-sahara-text-secondary hover:bg-sahara-card transition-colors">
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
