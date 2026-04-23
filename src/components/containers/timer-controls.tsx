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
  ClockPlus,
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
    <div className="flex flex-col items-center gap-8">
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
            className="px-6 py-2 text-xs font-bold tracking-wider"
          >
            {p.label}
          </Button>
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
        <Button
          variant="outline"
          size="icon"
          intent="default"
          shape="rounded-full"
          onClick={() => adjustDuration(-5)}
          className="border-sahara-border/30 text-sahara-text-secondary hover:border-sahara-primary/40 hover:text-sahara-primary"
        >
          <Minus className="w-3.5 h-3.5" />
        </Button>

        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-sahara-border/30 bg-sahara-surface shadow-sm">
          <span className="text-sm font-semibold text-sahara-text tabular-nums tracking-wide">
            {formatTimeAmPm(startTime)}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-sahara-text-muted" />
          <span className="text-sm font-semibold text-sahara-text tabular-nums tracking-wide">
            {formatTimeAmPm(endTime)}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          intent="default"
          shape="rounded-full"
          onClick={() => adjustDuration(5)}
          className="border-sahara-border/30 text-sahara-text-secondary hover:border-sahara-primary/40 hover:text-sahara-primary"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap justify-center">
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
              className="gap-2"
            >
              <Coffee className="w-4 h-4" />
              {isWorkPhase ? "Start Break" : "Back to Work"}
            </Button>

            <Button
              variant="solid"
              intent="amber"
              size="md"
              shape="rounded-full"
              onClick={() => addFiveMinutes()}
              className="gap-2"
            >
              <ClockPlus className="w-4 h-4" />
              Add 5 Min
            </Button>

            <Button
              variant="outline"
              intent="slate"
              size="sm"
              shape="rounded-full"
              onClick={() => endWithoutBreak()}
              className="gap-1.5"
            >
              <Flag className="w-4 h-4" />
              End Session
            </Button>

            <div className="h-8 w-px bg-sahara-border/20 mx-1" />

            {overtimeSeconds > 0 && (
              <Button
                variant="solid"
                intent="sahara"
                size="md"
                shape="rounded-full"
                onClick={pause}
                className="gap-2"
              >
                <Pause className="w-4 h-4 fill-current" />
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
              className="gap-2"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              START FOCUS
            </Button>

            <div className="h-8 w-px bg-sahara-border/20 mx-1" />

            <Button
              variant="outline"
              size="icon"
              intent="default"
              shape="rounded-full"
              onClick={reset}
              className="border-sahara-border/30 text-sahara-text-secondary p-3"
            >
              <RotateCcw className="w-4 h-4" />
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
                className="gap-2"
              >
                <Pause className="w-4 h-4 fill-current" />
                PAUSE
              </Button>
            ) : (
              <Button
                variant="solid"
                intent="sahara"
                size="md"
                shape="rounded-full"
                onClick={resume}
                className="gap-2"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                RESUME
              </Button>
            )}

            <div className="h-8 w-px bg-sahara-border/20 mx-1" />

            <Button
              variant="outline"
              intent="green"
              size="sm"
              shape="rounded-full"
              onClick={() => {
                setModalMode("finish");
                setShowFinishModal(true);
              }}
              className="gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finish
            </Button>

            <Button
              variant="outline"
              intent="red"
              size="sm"
              shape="rounded-full"
              onClick={() => abandonSession()}
              className="gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Abandon
            </Button>

            <div className="h-8 w-px bg-sahara-border/20 mx-1" />

            <Button
              variant="outline"
              size="icon"
              intent="default"
              shape="rounded-full"
              onClick={reset}
              className="border-sahara-border/30 text-sahara-text-secondary p-3"
            >
              <RotateCcw className="w-4 h-4" />
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
