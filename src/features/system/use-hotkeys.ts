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
  const reset = useTimerStore((s) => s.reset);
  const finishSession = useTimerStore((s) => s.finishSession);
  const hotkey = useSettingsStore((s) => s.settings.hotkey);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const cmd = e.metaKey || e.ctrlKey;

      if (cmd && e.key === "Enter") {
        e.preventDefault();
        if (status === "idle") start();
        else if (status === "running") pause();
        else if (status === "paused") resume();
        return;
      }

      if (cmd && e.key.toLowerCase() === "r") {
        e.preventDefault();
        reset();
        return;
      }

      if (cmd && e.key.toLowerCase() === "f") {
        e.preventDefault();
        if (status === "focus_complete") {
          finishSession().catch(() => {});
        }
        return;
      }

      if (e.key === "Escape") {
        window.dispatchEvent(new CustomEvent("app:escape"));
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [status, start, pause, resume, reset, finishSession]);

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
