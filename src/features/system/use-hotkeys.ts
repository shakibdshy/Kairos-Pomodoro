import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { invokeHotkey, invokeUnregisterHotkey } from "@/lib/tauri";

export function useHotkeys() {
  const status = useTimerStore((s) => s.status);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);

  useEffect(() => {
    invokeHotkey("CommandOrControl+Alt+S").catch(() => {});

    const unlisten = listen("hotkey:toggle-timer", () => {
      if (status === "idle") start();
      else if (status === "running") pause();
      else if (status === "paused") resume();
    });

    return () => {
      unlisten.then((fn) => fn());
      invokeUnregisterHotkey("CommandOrControl+Alt+S").catch(() => {});
    };
  }, [status, start, pause, resume]);
}
