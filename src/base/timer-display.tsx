import { Text } from "@/ui/text";
import { formatSeconds } from "@/lib/time";
import type { TimerPhase } from "@/features/timer/timer-types";

interface TimerDisplayProps {
  secondsRemaining: number;
  totalSeconds: number;
  phase: TimerPhase;
}

export function TimerDisplay({
  secondsRemaining,
  totalSeconds,
}: TimerDisplayProps) {
  const progress =
    totalSeconds > 0
      ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100
      : 0;
  const radius = 180;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="400" height="400" className="-rotate-90">
        {/* Background Track */}
        <circle
          cx="200"
          cy="200"
          r={radius}
          fill="none"
          stroke="#f0e8df"
          strokeWidth="1"
        />
        {/* Active Progress */}
        <circle
          cx="200"
          cy="200"
          r={radius}
          fill="none"
          stroke="#c2652a"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-300"
        />
        {/* Decorative Indicator Dot */}
        {progress > 0 && (
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
        <Text variant="timer" className="text-sahara-primary">
          {formatSeconds(secondsRemaining)}
        </Text>
        <p className="text-[10px] tracking-[0.3em] font-bold text-sahara-text-muted mt-2 uppercase">
          Focus Remaining
        </p>
      </div>
    </div>
  );
}
