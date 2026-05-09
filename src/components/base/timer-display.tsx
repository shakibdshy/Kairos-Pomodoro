import { useEffect, useRef, useState, useMemo } from "react";
import { useAnimationFrame } from "framer-motion";
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
  style?: "solid" | "zigzag";
}

const SIZE_DESKTOP = 400;
const RADIUS_DESKTOP = 180;
const CENTER_DESKTOP = SIZE_DESKTOP / 2;

const SIZE_MOBILE = 260;
const RADIUS_MOBILE = 116;
const CENTER_MOBILE = SIZE_MOBILE / 2;

function generateWavyCirclePath(
  cx: number,
  cy: number,
  r: number,
  amplitude: number,
  frequency: number,
  phase: number,
) {
  let d = "";
  const steps = 180;
  for (let i = 0; i <= steps; i++) {
    const angle = (i * 2 * Math.PI) / steps;
    const wave = Math.sin(angle * frequency + phase) * amplitude;
    const currentRadius = r + wave;
    const x = cx + currentRadius * Math.cos(angle);
    const y = cy + currentRadius * Math.sin(angle);
    if (i === 0) {
      d += `M ${x} ${y} `;
    } else {
      d += `L ${x} ${y} `;
    }
  }
  return d;
}

function WavyRing({
  cx,
  cy,
  r,
  progress,
  isRunning,
  style,
  strokeWidth,
  className,
  showDot,
}: {
  cx: number;
  cy: number;
  r: number;
  progress: number;
  isRunning: boolean;
  style: string;
  strokeWidth: string;
  className: string;
  showDot?: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  const amplitude = style === "zigzag" ? 8 : 0;
  const frequency = 12;

  useAnimationFrame((time) => {
    if (!pathRef.current) return;

    // Slither phase
    const phase = style === "zigzag" && isRunning ? -(time / 400) : 0;
    pathRef.current.setAttribute(
      "d",
      generateWavyCirclePath(cx, cy, r, amplitude, frequency, phase),
    );

    if (dotRef.current && showDot && progress > 0 && progress < 100) {
      const angle = (progress / 100) * 2 * Math.PI;
      const wave = Math.sin(angle * frequency + phase) * amplitude;
      const currentRadius = r + wave;
      dotRef.current.setAttribute(
        "cx",
        String(cx + currentRadius * Math.cos(angle)),
      );
      dotRef.current.setAttribute(
        "cy",
        String(cy + currentRadius * Math.sin(angle)),
      );
    }
  });

  const staticD = useMemo(
    () => generateWavyCirclePath(cx, cy, r, amplitude, frequency, 0),
    [cx, cy, r, amplitude, frequency],
  );

  return (
    <>
      <path
        ref={pathRef}
        d={staticD}
        fill="none"
        className={className}
        strokeWidth={strokeWidth}
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 - progress}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 300ms ease" }}
      />
      {showDot && progress > 0 && progress < 100 && (
        <circle
          ref={dotRef}
          cx={cx + r * Math.cos((progress / 100) * 2 * Math.PI)}
          cy={cy + r * Math.sin((progress / 100) * 2 * Math.PI)}
          r="6"
          className="fill-sahara-primary"
          style={{ transition: "opacity 1000ms ease" }}
        />
      )}
    </>
  );
}

export function TimerDisplay({
  secondsRemaining,
  totalSeconds,
  phase,
  overtimeSeconds = 0,
  editable = false,
  onDurationChange,
  style = "solid",
}: TimerDisplayProps) {
  const isRunning = secondsRemaining > 0 && secondsRemaining < totalSeconds;
  const isComplete = secondsRemaining <= 0 || overtimeSeconds > 0;
  const progress =
    totalSeconds > 0
      ? Math.min(100, ((totalSeconds - secondsRemaining) / totalSeconds) * 100)
      : 100;
      
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
        <WavyRing
          cx={CENTER_DESKTOP}
          cy={CENTER_DESKTOP}
          r={RADIUS_DESKTOP}
          progress={100}
          isRunning={isRunning}
          style={style}
          strokeWidth="1"
          className="stroke-sahara-ring-track"
          showDot={false}
        />
        <WavyRing
          cx={CENTER_DESKTOP}
          cy={CENTER_DESKTOP}
          r={RADIUS_DESKTOP}
          progress={progress}
          isRunning={isRunning}
          style={style}
          strokeWidth={style === "zigzag" ? "6" : "4"}
          className={cn(
            isComplete
              ? "stroke-sahara-ring-complete"
              : "stroke-sahara-primary",
          )}
          showDot={true}
        />
      </svg>

      {/* Mobile SVG */}
      <svg
        width={SIZE_MOBILE}
        height={SIZE_MOBILE}
        className="-rotate-90 md:hidden"
      >
        <WavyRing
          cx={CENTER_MOBILE}
          cy={CENTER_MOBILE}
          r={RADIUS_MOBILE}
          progress={100}
          isRunning={isRunning}
          style={style}
          strokeWidth="1"
          className="stroke-sahara-ring-track"
          showDot={false}
        />
        <WavyRing
          cx={CENTER_MOBILE}
          cy={CENTER_MOBILE}
          r={RADIUS_MOBILE}
          progress={progress}
          isRunning={isRunning}
          style={style}
          strokeWidth={style === "zigzag" ? "5" : "3"}
          className={cn(isComplete ? "stroke-sahara-ring-complete" : "stroke-sahara-primary")}
          showDot={true}
        />
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
                  setRawInput(
                    formatEditableValueFromSeconds(originalSecondsRef.current),
                  );
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
