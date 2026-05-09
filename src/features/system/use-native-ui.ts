import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { formatSeconds } from "@/lib/time";
import { isTauri } from "@/lib/tauri";

const PHASE_ICONS: Record<string, string> = {
  work: "\u{1F345}",
  short_break: "\u2615",
  long_break: "\u2615",
};

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

    const phaseLabel = phase === "work" ? "Focus" : "Break";
    const phaseIcon = phase === "work" ? "\u{1F351}" : "\u2615";

    const menubarTooltip = `Kairos-Pomodoro - ${phaseLabel} ${formatSeconds(secondsRemaining)}`;
    invoke("menubar_set_tooltip", { tooltip: menubarTooltip }).catch(() => {});

    const trayTooltip =
      status === "focus_complete" || overtimeSeconds > 0
        ? `+${formatOvertime(totalSeconds, overtimeSeconds)} OT ${phaseIcon}`
        : `${formatSeconds(secondsRemaining)} ${phaseIcon}`;
    invoke("plugin:tray|set_tooltip", { tooltip: trayTooltip }).catch(() => {});

    return () => {
      invoke("plugin:tray|set_tooltip", { tooltip: "" }).catch(() => {});
    };
  }, [secondsRemaining, phase, status, overtimeSeconds, totalSeconds]);
}
