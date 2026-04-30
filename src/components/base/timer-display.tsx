import { useEffect, useRef, useState } from "react";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";
import { formatSeconds } from "@/lib/time";
import {
  sanitizeTimeInput,
  parseTimeInput,
  formatEditableValueFromSeconds,
  formatEditingDisplay,
} from "@/lib/timer-utils";
import type { TimerPhase } from "@/features/timer/timer-types";

interface TimerDisplayProps {
  secondsRemaining: number;
  totalSeconds: number;
  phase: TimerPhase;
  overtimeSeconds?: number;
  editable?: boolean;
  onDurationChange?: (seconds: number) => void;
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
  editable = false,
  onDurationChange,
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
  const [rawInput, setRawInput] = useState(() =>
    formatEditableValueFromSeconds(secondsRemaining),
  );
  const [isEditing, setIsEditing] = useState(false);
  const originalSecondsRef = useRef(secondsRemaining);
  const cancelledRef = useRef(false);
  const displayedInputValue = isEditing
    ? rawInput
    : formatEditingDisplay(rawInput || "0");

  useEffect(() => {
    if (!editable || !isEditing) {
      setRawInput(formatEditableValueFromSeconds(secondsRemaining));
    }
  }, [editable, isEditing, secondsRemaining]);

  const commitDuration = (nextRawInput: string) => {
    if (!editable || !onDurationChange) return;

    const nextSeconds = parseTimeInput(nextRawInput);
    if (nextSeconds <= 0) {
      setRawInput(formatEditableValueFromSeconds(secondsRemaining));
      return;
    }

    onDurationChange(nextSeconds);
    setRawInput(formatEditableValueFromSeconds(nextSeconds));
  };

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
        {editable && !isComplete ? (
          <label className="group flex items-center justify-center">
            <span className="sr-only">Set timer duration</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9:]{0,2}(:[0-9]{0,2})?"
              aria-label="Set timer duration"
              value={displayedInputValue}
              onChange={(event) => {
                const nextRawInput = sanitizeTimeInput(event.target.value);
                setRawInput(nextRawInput);

                const nextSeconds = parseTimeInput(nextRawInput);
                if (nextSeconds > 0) {
                  onDurationChange?.(nextSeconds);
                }
              }}
              onFocus={(event) => {
                originalSecondsRef.current = secondsRemaining;
                cancelledRef.current = false;
                setIsEditing(true);
                requestAnimationFrame(() => {
                  const length = event.target.value.length;
                  event.target.setSelectionRange(length, length);
                });
              }}
              onBlur={() => {
                setIsEditing(false);
                if (!cancelledRef.current) {
                  commitDuration(rawInput);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }

                if (event.key === "Escape") {
                  cancelledRef.current = true;
                  onDurationChange?.(originalSecondsRef.current);
                  setRawInput(formatEditableValueFromSeconds(originalSecondsRef.current));
                  setIsEditing(false);
                  event.currentTarget.blur();
                }
              }}
              className={cn(
                "w-[5.5ch] rounded-2xl border border-transparent bg-transparent px-3 md:px-4 text-center font-serif leading-none tracking-tight text-sahara-primary outline-none transition-all [font-variant-numeric:tabular-nums]",
                "text-[76px] md:text-[120px]",
                "hover:border-sahara-primary/20 hover:bg-sahara-primary/5",
                "focus:border-sahara-primary/30 focus:bg-sahara-primary/8 focus:shadow-[0_0_0_1px_rgba(194,101,42,0.12)]",
              )}
            />
          </label>
        ) : (
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
        )}
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


