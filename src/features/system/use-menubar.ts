import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { formatSeconds } from "@/lib/time";
import { isTauri } from "@/lib/tauri";

const PHASE_ICONS = {
  work: "\u{1F345}",
  short_break: "\u2615",
  long_break: "\u2615",
} as const;

function buildMenubarTitle(
  status: string,
  phase: string,
  secondsRemaining: number,
  overtimeSeconds: number,
  totalSeconds: number,
): string {
  if (status === "idle") return "";

  const icon = PHASE_ICONS[phase as keyof typeof PHASE_ICONS] || "\u{1F345}";

  if (status === "focus_complete" || overtimeSeconds > 0) {
    const cumulative = totalSeconds + overtimeSeconds;
    const mins = Math.floor(cumulative / 60);
    const secs = cumulative % 60;
    return `${icon} +${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return `${icon} ${formatSeconds(secondsRemaining)}`;
}

export function useMenubar() {
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const overtimeSeconds = useTimerStore((s) => s.overtimeSeconds);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);

  useEffect(() => {
    if (!isTauri()) return;

    if (status === "idle") {
      invoke("menubar_hide").catch(() => {});
      return;
    }

    const title = buildMenubarTitle(
      status,
      phase,
      secondsRemaining,
      overtimeSeconds,
      totalSeconds,
    );

    invoke("menubar_show").catch(() => {});
    invoke("menubar_set_title", { title }).catch(() => {});

    const tooltip =
      phase === "work"
        ? `Kairos-Pomodoro - Focus ${formatSeconds(secondsRemaining)}`
        : `Kairos-Pomodoro - Break ${formatSeconds(secondsRemaining)}`;
    invoke("menubar_set_tooltip", { tooltip }).catch(() => {});
  }, [secondsRemaining, phase, status, overtimeSeconds, totalSeconds]);
}
