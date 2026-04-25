import { useState, useMemo } from "react";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { TimerDisplay } from "@/components/base/timer-display";
import { IntentionSelector } from "@/components/intention-selector";
import { Button } from "@/components/ui/button";
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
  Flag,
} from "lucide-react";
import { formatTimeAmPm } from "@/lib/time";
import type { TimerPhase } from "@/features/timer/timer-types";

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

  const [endTime, startTime] = useMemo(() => {
    const end = isFocusComplete
      ? new Date()
      : new Date(Date.now() + secondsRemaining * 1000);
    const start = new Date(end.getTime() - totalSeconds * 1000);
    return [end, start];
  }, [secondsRemaining, totalSeconds, isFocusComplete]);

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
    <div className="flex flex-col items-center gap-5 md:gap-8 w-full">
      {/* Phase Selector */}
      <div className="flex bg-sahara-card p-1 rounded-full border border-sahara-border/20">
        {phases.map((p) => (
          <Button
            key={p.id}
            variant="ghost"
            size="sm"
            intent="default"
            shape="rounded-full"
            active={phase === p.id}
            onClick={() => setPhase(p.id)}
            disabled={status !== "idle"}
            className="px-3 sm:px-4 md:px-6 py-2 text-[10px] sm:text-xs font-bold tracking-wider"
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Intention Selector */}
      <IntentionSelector
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
        disabled={status !== "idle"}
      />

      {/* Timer Display */}
      <TimerDisplay
        secondsRemaining={secondsRemaining}
        totalSeconds={totalSeconds}
        phase={phase}
        overtimeSeconds={overtimeSeconds}
      />

      {/* Duration Adjuster with Time Range */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="outline"
          size="icon"
          intent="default"
          shape="rounded-full"
          onClick={() => adjustDuration(-5)}
          className="border-sahara-border/30 text-sahara-text-secondary hover:border-sahara-primary/40 hover:text-sahara-primary shrink-0"
        >
          <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </Button>

        <div className="inline-flex items-center gap-1.5 md:gap-2.5 px-2.5 sm:px-4 py-1.5 md:py-2 rounded-full border border-sahara-border/30 bg-sahara-surface shadow-sm">
          <span className="text-xs md:text-sm font-semibold text-sahara-text tabular-nums tracking-wide">
            {formatTimeAmPm(startTime)}
          </span>
          <ArrowRight className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-sahara-text-muted" />
          <span className="text-xs md:text-sm font-semibold text-sahara-text tabular-nums tracking-wide">
            {formatTimeAmPm(endTime)}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          intent="default"
          shape="rounded-full"
          onClick={() => adjustDuration(5)}
          className="border-sahara-border/30 text-sahara-text-secondary hover:border-sahara-primary/40 hover:text-sahara-primary shrink-0"
        >
          <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center max-w-lg md:max-w-none">
        {isFocusComplete ? (
          <>
            <Button
              variant="solid"
              intent="emerald"
              size="md"
              shape="rounded-full"
              onClick={() => {
                setModalMode("nextPhase");
                setShowFinishModal(true);
              }}
              className="gap-1.5 md:gap-2 text-[10px] md:text-xs"
            >
              <Coffee className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {isWorkPhase ? "Start Break" : "Back to Work"}
            </Button>

            {/* <Button
              variant="solid"
              intent="amber"
              size="md"
              shape="rounded-full"
              onClick={() => addFiveMinutes()}
              className="gap-1.5 md:gap-2 text-[10px] md:text-xs"
            >
              <ClockPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Add 5 Min
            </Button> */}

            <Button
              variant="outline"
              intent="slate"
              size="sm"
              shape="rounded-full"
              onClick={() => endWithoutBreak()}
              className="gap-1 md:gap-1.5 text-[10px]"
            >
              <Flag className="w-3.5 h-3.5 md:w-4 md:h-4" />
              End Session
            </Button>

            <div className="h-6 md:h-8 w-px bg-sahara-border/20 mx-0.5 md:mx-1 hidden sm:block" />

            {overtimeSeconds > 0 && (
              <Button
                variant="solid"
                intent="sahara"
                size="md"
                shape="rounded-full"
                onClick={pause}
                className="gap-1.5 md:gap-2 text-[10px] md:text-xs"
              >
                <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                Pause Overtime
              </Button>
            )}
          </>
        ) : status === "idle" ? (
          <>
            <Button
              variant="solid"
              intent="sahara"
              size="lg"
              shape="rounded-full"
              onClick={() => start()}
              className="gap-1.5 md:gap-2 text-xs md:text-xs px-6 md:px-8 py-3 md:py-3.5"
            >
              <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current ml-0.5" />
              START FOCUS
            </Button>

            <div className="h-6 md:h-8 w-px bg-sahara-border/20 mx-0.5 md:mx-1 hidden sm:block" />

            <Button
              variant="outline"
              size="icon"
              intent="default"
              shape="rounded-full"
              onClick={reset}
              className="border-sahara-border/30 text-sahara-text-secondary p-2 md:p-3"
            >
              <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
          </>
        ) : (
          <>
            {status === "running" ? (
              <Button
                variant="solid"
                intent="sahara"
                size="md"
                shape="rounded-full"
                onClick={pause}
                className="gap-1.5 md:gap-2 text-[10px] md:text-xs"
              >
                <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                PAUSE
              </Button>
            ) : (
              <Button
                variant="solid"
                intent="sahara"
                size="md"
                shape="rounded-full"
                onClick={resume}
                className="gap-1.5 md:gap-2 text-[10px] md:text-xs"
              >
                <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current ml-0.5" />
                RESUME
              </Button>
            )}

            <div className="h-6 md:h-8 w-px bg-sahara-border/20 mx-0.5 md:mx-1 hidden sm:block" />

            <Button
              variant="outline"
              intent="green"
              size="sm"
              shape="rounded-full"
              onClick={() => {
                setModalMode("finish");
                setShowFinishModal(true);
              }}
              className="gap-1 md:gap-1.5 text-[10px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Finish
            </Button>

            <Button
              variant="outline"
              intent="red"
              size="sm"
              shape="rounded-full"
              onClick={() => abandonSession()}
              className="gap-1 md:gap-1.5 text-[10px]"
            >
              <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Abandon
            </Button>

            <div className="h-6 md:h-8 w-px bg-sahara-border/20 mx-0.5 md:mx-1 hidden sm:block" />

            <Button
              variant="outline"
              size="icon"
              intent="default"
              shape="rounded-full"
              onClick={reset}
              className="border-sahara-border/30 text-sahara-text-secondary p-2 md:p-3"
            >
              <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
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
