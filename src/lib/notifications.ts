import { useSettingsStore } from "@/features/settings/use-settings-store";
import { useNotificationStore } from "@/features/settings/use-notification-store";

type NotificationType = "session-complete" | "break-over" | "focus-start";

const NOTIFICATION_TITLES: Record<NotificationType, string> = {
  "session-complete": "Focus Session Complete!",
  "break-over": "Break is Over",
  "focus-start": "Time to Focus",
};

function getSettings() {
  return useSettingsStore.getState().settings;
}

async function playChime(): Promise<void> {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const frequencies = [523.25, 659.25, 783.99];
    const durations = [0.15, 0.15, 0.3];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durations[i]);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + durations.slice(0, i).reduce((a, b) => a + b, 0));
      osc.stop(now + durations.slice(0, i + 1).reduce((a, b) => a + b, 0));
    });

    setTimeout(() => ctx.close(), 1000);
  } catch (e) {
    console.error("[Notification] Audio chime failed:", e);
  }
}

export async function sendNotification(
  type: NotificationType,
  body?: string,
): Promise<void> {
  const settings = getSettings();

  if (settings.respectDnd && typeof window !== "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dndEnabled = await (window as any).__TAURI__?.core?.invoke(
        "is_dnd_enabled",
      );
      if (dndEnabled) return;
    } catch {
      // DnD check failed, continue with notification
    }
  }

  if (typeof window !== "undefined" && (window as any).__TAURI__) {
    try {
      const { sendNotification, isPermissionGranted, requestPermission } =
        await import("@tauri-apps/plugin-notification");

      let granted = await isPermissionGranted();
      if (!granted) {
        console.log("[Notification] Requesting permission...");
        const permission = await requestPermission();
        granted = permission === "granted";

        useNotificationStore.getState().reset();
        useNotificationStore
          .getState()
          .checkPermission()
          .catch(() => {});
      }

      if (granted) {
        await sendNotification({
          title: NOTIFICATION_TITLES[type],
          body: body || "",
        });
        console.log("[Notification] Sent:", NOTIFICATION_TITLES[type]);
      } else {
        console.warn(
          "[Notification] Permission denied, notification not sent.",
        );
      }
    } catch (e) {
      console.error("[Notification] Failed to send:", e);
    }
  }

  if (settings.soundEnabled) {
    playChime();
  }
}
