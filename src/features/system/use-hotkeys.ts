import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import { invokeHotkey, invokeUnregisterHotkey, isTauri } from "@/lib/tauri";

export function useHotkeys() {
  const status = useTimerStore((s) => s.status);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const hotkey = useSettingsStore((s) => s.settings.hotkey);

  useEffect(() => {
    if (!isTauri()) return;

    invokeHotkey(hotkey).catch(() => {});

    const unlisten = listen("hotkey:toggle-timer", () => {
      if (status === "idle") start();
      else if (status === "running") pause();
      else if (status === "paused") resume();
      else if (status === "focus_complete") resume();
    });

    return () => {
      unlisten.then((fn) => fn()).catch(() => {});
      invokeUnregisterHotkey(hotkey).catch(() => {});
    };
  }, [status, start, pause, resume, hotkey]);
}
