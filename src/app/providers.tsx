import { useEffect, type ReactNode } from "react";
import { initDb } from "@/lib/db";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import { useTaskStore } from "@/features/tasks/use-task-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { useTray } from "@/features/system/use-tray";
import { useHotkeys } from "@/features/system/use-hotkeys";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const settings = useSettingsStore((s) => s.settings);
  const loaded = useSettingsStore((s) => s.loaded);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const setDurations = useTimerStore((s) => s.setDurations);

  useEffect(() => {
    initDb().then(() => {
      loadSettings();
      loadTasks();
    });
  }, [loadSettings, loadTasks]);

  useEffect(() => {
    if (loaded) {
      setDurations(settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration);
    }
  }, [loaded, settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration, setDurations]);

  useTray();
  useHotkeys();

  return <>{children}</>;
}
