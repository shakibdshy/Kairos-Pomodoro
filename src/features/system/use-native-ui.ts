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

function formatOvertime(totalSeconds: number, overtimeSeconds: number): string {
  const cumulative = totalSeconds + overtimeSeconds;
  const mins = Math.floor(cumulative / 60);
  const secs = cumulative % 60;
  return `+${mins}:${secs.toString().padStart(2, "0")}`;
}

export function useNativeUI() {
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const overtimeSeconds = useTimerStore((s) => s.overtimeSeconds);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);

  useEffect(() => {
    if (!isTauri()) return;

    if (status === "idle") {
      invoke("menubar_hide").catch(() => {});
      invoke("plugin:tray|set_tooltip", { tooltip: "" }).catch(() => {});
      return;
    }

    const icon = PHASE_ICONS[phase as keyof typeof PHASE_ICONS] || "\u{1F345}";

    const title =
      status === "focus_complete" || overtimeSeconds > 0
        ? `${icon} ${formatOvertime(totalSeconds, overtimeSeconds)}`
        : `${icon} ${formatSeconds(secondsRemaining)}`;

    invoke("menubar_show").catch(() => {});
    invoke("menubar_set_title", { title }).catch(() => {});

    const menubarTooltip =
      phase === "work"
        ? `Kairos-Pomodoro - Focus ${formatSeconds(secondsRemaining)}`
        : `Kairos-Pomodoro - Break ${formatSeconds(secondsRemaining)}`;
    invoke("menubar_set_tooltip", { tooltip: menubarTooltip }).catch(() => {});

    const trayTooltip =
      status === "focus_complete" || overtimeSeconds > 0
        ? `+${formatOvertime(totalSeconds, overtimeSeconds)} OT ${phase === "work" ? "\u{1F351}" : "\u2615"}`
        : `${formatSeconds(secondsRemaining)} ${phase === "work" ? "\u{1F351}" : "\u2615"}`;
    invoke("plugin:tray|set_tooltip", { tooltip: trayTooltip }).catch(() => {});

    return () => {
      invoke("plugin:tray|set_tooltip", { tooltip: "" }).catch(() => {});
    };
  }, [secondsRemaining, phase, status, overtimeSeconds, totalSeconds]);
}
