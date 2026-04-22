import { Text } from "@/components/ui/text";
import { formatSeconds, formatOvertime } from "@/lib/time";
import type { TimerPhase } from "@/features/timer/timer-types";

interface TimerDisplayProps {
  secondsRemaining: number;
  totalSeconds: number;
  phase: TimerPhase;
  overtimeSeconds?: number;
}

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
  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const cumulativeOvertime = totalSeconds + overtimeSeconds;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="400" height="400" className="-rotate-90">
        <circle
          cx="200"
          cy="200"
          r={radius}
          fill="none"
          stroke="#f0e8df"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="200"
          r={radius}
          fill="none"
          stroke={isComplete ? "#c17767" : "#c2652a"}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-300"
        />
        {progress > 0 && progress < 100 && (
          <circle
            cx={200 + radius * Math.cos((progress / 100) * 2 * Math.PI)}
            cy={200 + radius * Math.sin((progress / 100) * 2 * Math.PI)}
            r="6"
            fill="#c2652a"
            className="transition-all duration-300"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Text variant="timer" className={isComplete ? "text-amber-600" : "text-sahara-primary"}>
          {isComplete
            ? `+${formatOvertime(cumulativeOvertime)}`
            : formatSeconds(secondsRemaining)}
        </Text>
        <p className="text-[10px] tracking-[0.3em] font-bold text-sahara-text-muted mt-2 uppercase">
          {isComplete
            ? "Overtime"
            : phase === "work" ? "Focus Remaining"
              : phase === "short_break" ? "Short Break"
                : "Long Break"}
        </p>
      </div>
    </div>
  );
}
