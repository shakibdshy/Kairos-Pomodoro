import { useState, useMemo } from "react";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { TimerDisplay } from "@/components/base/timer-display";
import { IntentionSelector } from "@/components/intention-selector";
import {
  FinishSessionModal,
  type SessionMood,
} from "@/components/base/finish-session-modal";
import {
  RotateCcw,
  Play,
  Pause,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Coffee,
  ClockPlus,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { TimerPhase } from "@/features/timer/timer-types";

function formatTimeBadge(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")}${ampm}`;
}

export function TimerControls() {
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);
  const overtimeSeconds = useTimerStore((s) => s.overtimeSeconds);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const reset = useTimerStore((s) => s.reset);
  const setPhase = useTimerStore((s) => s.setPhase);
  const adjustDuration = useTimerStore((s) => s.adjustDuration);
  const finishSession = useTimerStore((s) => s.finishSession);
  const abandonSession = useTimerStore((s) => s.abandonSession);
  const selectedCategory = useTimerStore((s) => s.selectedCategory);
  const setSelectedCategory = useTimerStore((s) => s.setSelectedCategory);
  const addFiveMinutes = useTimerStore((s) => s.addFiveMinutes);
  const confirmStartNextPhase = useTimerStore((s) => s.confirmStartNextPhase);
  const endWithoutBreak = useTimerStore((s) => s.endWithoutBreak);

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [modalMode, setModalMode] = useState<"finish" | "nextPhase">("finish");

  const phases: { id: TimerPhase; label: string }[] = [
    { id: "work", label: "Work" },
    { id: "short_break", label: "Short Break" },
    { id: "long_break", label: "Long Break" },
  ];

  const durationMinutes = Math.round(totalSeconds / 60);

  const isFocusComplete = status === "focus_complete";
  const isWorkPhase = phase === "work";

  const endTime = useMemo(() => {
    if (isFocusComplete) return new Date();
    const now = new Date();
    return new Date(now.getTime() + secondsRemaining * 1000);
  }, [secondsRemaining, isFocusComplete]);

  const startTime = useMemo(() => {
    return new Date(endTime.getTime() - totalSeconds * 1000);
  }, [endTime, totalSeconds]);

  const handleFinishWithReflection = async (data: {
    mood: SessionMood;
    notes: string;
  }) => {
    if (modalMode === "nextPhase") {
      await confirmStartNextPhase(data.mood, data.notes);
    } else {
      await finishSession(data.mood, data.notes);
    }
    setShowFinishModal(false);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex bg-sahara-card p-1 rounded-full border border-sahara-border/20">
        {phases.map((p) => (
          <button
            key={p.id}
            onClick={() => setPhase(p.id)}
            disabled={status !== "idle"}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold tracking-wider transition-all",
              phase === p.id
                ? "bg-sahara-surface text-sahara-primary shadow-sm"
                : "text-sahara-text-muted hover:text-sahara-text-secondary",
              status !== "idle" && "opacity-50 cursor-not-allowed",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <IntentionSelector
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
        disabled={status !== "idle"}
      />

      <TimerDisplay
        secondsRemaining={secondsRemaining}
        totalSeconds={totalSeconds}
        phase={phase}
        overtimeSeconds={overtimeSeconds}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => adjustDuration(-5)}
          className={cn(
            "p-2 rounded-full border transition-all",
            "border-sahara-border/30 text-sahara-text-secondary hover:bg-sahara-card hover:border-sahara-primary/40 hover:text-sahara-primary cursor-pointer",
          )}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-sahara-border/30 bg-sahara-surface shadow-sm">
          <span className="text-sm font-semibold text-sahara-text tabular-nums tracking-wide">
            {formatTimeBadge(startTime)}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-sahara-text-muted" />
          <span className="text-sm font-semibold text-sahara-text tabular-nums tracking-wide">
            {formatTimeBadge(endTime)}
          </span>
        </div>

        <button
          onClick={() => adjustDuration(5)}
          className={cn(
            "p-2 rounded-full border transition-all",
            "border-sahara-border/30 text-sahara-text-secondary hover:bg-sahara-card hover:border-sahara-primary/40 hover:text-sahara-primary cursor-pointer",
          )}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-4 flex-wrap justify-center">
        {isFocusComplete ? (
          <>
            <button
              onClick={() => {
                setModalMode("nextPhase");
                setShowFinishModal(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Coffee className="w-4 h-4" />
              {isWorkPhase ? "Start Break" : "Back to Work"}
            </button>

            <button
              onClick={() => addFiveMinutes()}
              className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
            >
              <ClockPlus className="w-4 h-4" />
              Add 5 Min
            </button>

            <button
              onClick={() => endWithoutBreak()}
              className="flex items-center gap-1.5 px-4 py-3 rounded-full font-bold text-[10px] tracking-wider uppercase border border-slate-300/50 text-slate-500 bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
            >
              <Flag className="w-4 h-4" />
              End Session
            </button>

            <div className="h-8 w-px bg-sahara-border/20 mx-1" />

            {overtimeSeconds > 0 && (
              <button
                onClick={pause}
                className="flex items-center gap-2 bg-sahara-primary text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20"
              >
                <Pause className="w-4 h-4 fill-current" />
                Pause Overtime
              </button>
            )}
          </>
        ) : status === "idle" ? (
          <>
            <button
              onClick={() => start()}
              className="flex items-center gap-2 bg-sahara-primary text-white px-8 py-3.5 rounded-full font-bold text-xs tracking-widest hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              START FOCUS
            </button>

            <div className="h-8 w-px bg-sahara-border/20 mx-1" />

            <button
              onClick={reset}
              className="p-3 rounded-full border border-sahara-border/30 text-sahara-text-secondary hover:bg-sahara-card transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            {status === "running" ? (
              <button
                onClick={pause}
                className="flex items-center gap-2 bg-sahara-primary text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20"
              >
                <Pause className="w-4 h-4 fill-current" />
                PAUSE
              </button>
            ) : (
              <button
                onClick={resume}
                className="flex items-center gap-2 bg-sahara-primary text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest hover:bg-sahara-primary/90 transition-colors shadow-lg shadow-sahara-primary/20"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                RESUME
              </button>
            )}

            <div className="h-8 w-px bg-sahara-border/20 mx-1" />

            <button
              onClick={() => {
                setModalMode("finish");
                setShowFinishModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-3 rounded-full font-bold text-[10px] tracking-wider uppercase border border-green-500/30 text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finish
            </button>

            <button
              onClick={() => abandonSession()}
              className="flex items-center gap-1.5 px-4 py-3 rounded-full font-bold text-[10px] tracking-wider uppercase border border-red-300/50 text-red-500 bg-red-50/50 hover:bg-red-100/80 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Abandon
            </button>

            <div className="h-8 w-px bg-sahara-border/20 mx-1" />

            <button
              onClick={reset}
              className="p-3 rounded-full border border-sahara-border/30 text-sahara-text-secondary hover:bg-sahara-card transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <FinishSessionModal
        open={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onSubmit={handleFinishWithReflection}
        category={selectedCategory}
        durationMinutes={durationMinutes}
      />
    </div>
  );
}
