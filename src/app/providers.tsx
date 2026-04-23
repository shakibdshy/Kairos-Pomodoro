import { useEffect, useState, type ReactNode } from "react";
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

function useDbInit() {
  const [state, setState] = useState<{ loading: boolean; error: string | null }>({
    loading: true,
    error: null,
  });

  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const checkNotificationPermission = useNotificationStore(
    (s) => s.checkPermission,
  );

  useEffect(() => {
    initDb()
      .then(() => {
        return Promise.all([
          loadSettings(),
          loadTasks(),
          checkNotificationPermission(),
        ]);
      })
      .then(() => {
        setState({ loading: false, error: null });
      })
      .catch((err) => {
        console.error("[Providers] Failed to initialize database:", err);
        setState({ loading: false, error: String(err) });
      });
  }, [loadSettings, loadTasks, checkNotificationPermission]);

  return state;
}

function useApplyTimerDurations() {
  const settings = useSettingsStore((s) => s.settings);
  const loaded = useSettingsStore((s) => s.loaded);
  const setDurations = useTimerStore((s) => s.setDurations);

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
}

export function Providers({ children }: ProvidersProps) {
  const { loading, error } = useDbInit();
  useApplyTimerDurations();
  useTray();
  useHotkeys();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-sahara-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-sahara-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sahara-text-muted text-sm tracking-widest uppercase font-bold">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-sahara-bg">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-red-500 text-sm">Failed to initialize database.</p>
          <p className="text-sahara-text-muted text-xs">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-sahara-primary text-white rounded-xl text-xs font-bold tracking-widest uppercase cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
