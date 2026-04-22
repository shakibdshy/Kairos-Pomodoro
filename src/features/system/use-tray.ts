import { useEffect } from "react";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { formatSeconds, formatOvertime } from "@/lib/time";

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
      label = `+${formatOvertime(cumulative)} OT ${phase === "work" ? "🍅" : "☕"}`;
    } else {
      label = `${formatSeconds(secondsRemaining)} ${phase === "work" ? "🍅" : "☕"}`;
    }

    if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
      import("@tauri-apps/api/core").then(({ invoke }) => {
        invoke("plugin:tray|set_tooltip", { tooltip: label }).catch(() => {});
      });
    }
  }, [secondsRemaining, phase, status, overtimeSeconds, totalSeconds]);
}
