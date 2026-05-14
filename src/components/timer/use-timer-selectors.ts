import { useMemo } from "react";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import { useUIStore } from "@/features/ui/use-ui-store";
import { formatTimeAmPm } from "@/lib/time";
import { POMOS_BEFORE_LONG_BREAK } from "@/lib/constants";
import type { TimerPhase } from "@/features/timer/timer-types";

export function useTimerSelectors() {
  const timerStyle = useSettingsStore((s) => s.settings.timerStyle);
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);
  const overtimeSeconds = useTimerStore((s) => s.overtimeSeconds);
  const durations = useTimerStore((s) => s.durations);
  const completedPomos = useTimerStore((s) => s.completedPomos);
  const selectedCategory = useTimerStore((s) => s.selectedCategory);
  const isFullscreenFocus = useUIStore((s) => s.isFullscreenFocus);

  const isFocus = phase === "work";
  const isBreak = phase === "short_break" || phase === "long_break";
  const isFocusComplete = status === "focus_complete";
  const isWorkPhase = phase === "work";
  const durationMinutes = Math.round(totalSeconds / 60);

  const detectedBreakPhase: TimerPhase =
    completedPomos > 0 && completedPomos % POMOS_BEFORE_LONG_BREAK === 0
      ? "long_break"
      : "short_break";

  const [endTime, startTime] = useMemo(() => {
    const end = isFocusComplete
      ? new Date()
      : new Date(Date.now() + secondsRemaining * 1000);
    const start = new Date(end.getTime() - totalSeconds * 1000);
    return [end, start];
  }, [secondsRemaining, totalSeconds, isFocusComplete]);

  return {
    timerStyle,
    phase,
    status,
    secondsRemaining,
    totalSeconds,
    overtimeSeconds,
    durations,
    completedPomos,
    selectedCategory,
    isFullscreenFocus,
    isFocus,
    isBreak,
    isFocusComplete,
    isWorkPhase,
    durationMinutes,
    detectedBreakPhase,
    startTime,
    endTime,
    startTimeAmPm: formatTimeAmPm(startTime),
    endTimeAmPm: formatTimeAmPm(endTime),
  };
}
