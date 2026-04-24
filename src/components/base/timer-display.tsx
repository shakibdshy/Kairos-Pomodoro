import { Text } from "@/components/ui/text";
import { formatSeconds } from "@/lib/time";
import type { TimerPhase } from "@/features/timer/timer-types";

interface TimerDisplayProps {
  secondsRemaining: number;
  totalSeconds: number;
  phase: TimerPhase;
  overtimeSeconds?: number;
}

const SIZE_DESKTOP = 400;
const RADIUS_DESKTOP = 180;
const CENTER_DESKTOP = SIZE_DESKTOP / 2;

const SIZE_MOBILE = 260;
const RADIUS_MOBILE = 116;
const CENTER_MOBILE = SIZE_MOBILE / 2;

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
  const circumferenceDesktop =
    2 * Math.PI * RADIUS_DESKTOP;
  const offsetDesktop =
    circumferenceDesktop - (progress / 100) * circumferenceDesktop;
  const circumferenceMobile =
    2 * Math.PI * RADIUS_MOBILE;
  const offsetMobile =
    circumferenceMobile - (progress / 100) * circumferenceMobile;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Desktop SVG */}
      <svg
        width={SIZE_DESKTOP}
        height={SIZE_DESKTOP}
        className="-rotate-90 hidden md:block"
      >
        <circle
          cx={CENTER_DESKTOP}
          cy={CENTER_DESKTOP}
          r={RADIUS_DESKTOP}
          fill="none"
          className="stroke-sahara-ring-track"
          strokeWidth="1"
        />
        <circle
          cx={CENTER_DESKTOP}
          cy={CENTER_DESKTOP}
          r={RADIUS_DESKTOP}
          fill="none"
          className={
            isComplete
              ? "stroke-sahara-ring-complete"
              : "stroke-sahara-primary"
          }
          strokeWidth="4"
          strokeDasharray={circumferenceDesktop}
          strokeDashoffset={offsetDesktop}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 300ms ease" }}
        />
        {progress > 0 && progress < 100 && (
          <circle
            cx={
              CENTER_DESKTOP +
              RADIUS_DESKTOP *
                Math.cos((progress / 100) * 2 * Math.PI)
            }
            cy={
              CENTER_DESKTOP +
              RADIUS_DESKTOP *
                Math.sin((progress / 100) * 2 * Math.PI)
            }
            r="6"
            className="fill-sahara-primary"
            style={{ transition: "all 300ms ease" }}
          />
        )}
      </svg>

      {/* Mobile SVG */}
      <svg
        width={SIZE_MOBILE}
        height={SIZE_MOBILE}
        className="-rotate-90 md:hidden"
      >
        <circle
          cx={CENTER_MOBILE}
          cy={CENTER_MOBILE}
          r={RADIUS_MOBILE}
          fill="none"
          className="stroke-sahara-ring-track"
          strokeWidth="1"
        />
        <circle
          cx={CENTER_MOBILE}
          cy={CENTER_MOBILE}
          r={RADIUS_MOBILE}
          fill="none"
          className={
            isComplete
              ? "stroke-sahara-ring-complete"
              : "stroke-sahara-primary"
          }
          strokeWidth="3"
          strokeDasharray={circumferenceMobile}
          strokeDashoffset={offsetMobile}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 300ms ease" }}
        />
        {progress > 0 && progress < 100 && (
          <circle
            cx={
              CENTER_MOBILE +
              RADIUS_MOBILE *
                Math.cos((progress / 100) * 2 * Math.PI)
            }
            cy={
              CENTER_MOBILE +
              RADIUS_MOBILE *
                Math.sin((progress / 100) * 2 * Math.PI)
            }
            r="4.5"
            className="fill-sahara-primary"
            style={{ transition: "all 300ms ease" }}
          />
        )}
      </svg>

      {/* Center text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Text
          variant="timer"
          className={cn(
            isComplete ? "text-amber-600" : "text-sahara-primary",
            "md:text-[120px] text-[76px]",
          )}
        >
          {isComplete
            ? `+${formatSeconds(totalSeconds + overtimeSeconds)}`
            : formatSeconds(secondsRemaining)}
        </Text>
        <p className="text-[10px] tracking-[0.3em] font-bold text-sahara-text-muted mt-1 md:mt-2 uppercase">
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

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
