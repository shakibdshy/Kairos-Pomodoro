import { useEffect } from "react";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { formatSeconds } from "@/lib/time";

export function useTray() {
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);

  useEffect(() => {
    if (status === "idle") return;

    const label = `${formatSeconds(secondsRemaining)} ${phase === "work" ? "🍅" : "☕"}`;

    if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
      import("@tauri-apps/api/core").then(({ invoke }) => {
        invoke("plugin:tray|set_tooltip", { tooltip: label }).catch(() => {});
      });
    }
  }, [secondsRemaining, phase, status]);
}
