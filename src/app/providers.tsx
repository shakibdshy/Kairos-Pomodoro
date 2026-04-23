import { useEffect, type ReactNode } from "react";
import { initDb } from "@/lib/db";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import { useTaskStore } from "@/features/tasks/use-task-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { useTray } from "@/features/system/use-tray";
import { useHotkeys } from "@/features/system/use-hotkeys";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { useNotificationStore } from "@/features/settings/use-notification-store";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const settings = useSettingsStore((s) => s.settings);
  const loaded = useSettingsStore((s) => s.loaded);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const setDurations = useTimerStore((s) => s.setDurations);
  const checkNotificationPermission = useNotificationStore(
    (s) => s.checkPermission,
  );

  useEffect(() => {
    initDb()
      .then(() => {
        loadSettings();
        loadTasks();
        checkNotificationPermission();
      })
      .catch((err) => {
        console.error("[Providers] Failed to initialize database:", err);
      });
  }, [loadSettings, loadTasks, checkNotificationPermission]);

  useEffect(() => {
    if (loaded) {
      setDurations(
        settings.workDuration,
        settings.shortBreakDuration,
        settings.longBreakDuration,
      );
    }
  }, [
    loaded,
    settings.workDuration,
    settings.shortBreakDuration,
    settings.longBreakDuration,
    setDurations,
  ]);

  useTray();
  useHotkeys();

  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
