import { Text } from "@/components/ui/text";
import { formatSeconds } from "@/lib/time";
import type { TimerPhase } from "@/features/timer/timer-types";

interface TimerDisplayProps {
  secondsRemaining: number;
  totalSeconds: number;
  phase: TimerPhase;
  overtimeSeconds?: number;
}

const SIZE = 400;
const RADIUS = 180;
const CENTER = SIZE / 2;

export function TimerDisplay({
  secondsRemaining,
  totalSeconds,
  phase,
  overtimeSeconds = 0,
}: TimerDisplayProps) {
  const isComplete = secondsRemaining <= 0 || overtimeSeconds > 0;
  const progress =
    totalSeconds > 0
      ? Math.min(100, ((totalSeconds - secondsRemaining) / totalSeconds) * 100)
      : 100;
  const circumference = 2 * Math.PI * RADIUS;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          className="stroke-sahara-ring-track"
          strokeWidth="1"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          className={isComplete ? "stroke-sahara-ring-complete" : "stroke-sahara-primary"}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 300ms ease" }}
        />
        {progress > 0 && progress < 100 && (
          <circle
            cx={CENTER + RADIUS * Math.cos((progress / 100) * 2 * Math.PI)}
            cy={CENTER + RADIUS * Math.sin((progress / 100) * 2 * Math.PI)}
            r="6"
            className="fill-sahara-primary"
            style={{ transition: "all 300ms ease" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Text
          variant="timer"
          className={isComplete ? "text-amber-600" : "text-sahara-primary"}
        >
          {isComplete
            ? `+${formatSeconds(totalSeconds + overtimeSeconds)}`
            : formatSeconds(secondsRemaining)}
        </Text>
        <p className="text-[10px] tracking-[0.3em] font-bold text-sahara-text-muted mt-2 uppercase">
          {isComplete
            ? "Overtime"
            : phase === "work"
              ? "Focus Remaining"
              : phase === "short_break"
                ? "Short Break"
                : "Long Break"}
        </p>
      </div>
    </div>
  );
}
