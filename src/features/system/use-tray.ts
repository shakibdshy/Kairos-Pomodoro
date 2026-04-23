import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { formatSeconds } from "@/lib/time";
import { isTauri } from "@/lib/tauri";

export function useTray() {
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const overtimeSeconds = useTimerStore((s) => s.overtimeSeconds);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);

  useEffect(() => {
    if (status === "idle") return;

    let label: string;
    if (status === "focus_complete" || overtimeSeconds > 0) {
      const cumulative = totalSeconds + overtimeSeconds;
      label = `+${formatSeconds(cumulative)} OT ${phase === "work" ? "\u{1F351}" : "\u2615"}`;
    } else {
      label = `${formatSeconds(secondsRemaining)} ${phase === "work" ? "\u{1F351}" : "\u2615"}`;
    }

    if (isTauri()) {
      invoke("plugin:tray|set_tooltip", { tooltip: label }).catch(() => {});
    }
  }, [secondsRemaining, phase, status, overtimeSeconds, totalSeconds]);
}
