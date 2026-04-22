import { useSettingsStore } from "@/features/settings/use-settings-store";
import { useNotificationStore } from "@/features/settings/use-notification-store";
import { isTauri, invoke } from "@/lib/tauri";

type NotificationType =
  | "session-complete"
  | "break-over"
  | "focus-start"
  | "focus-complete";

const NOTIFICATION_TITLES: Record<NotificationType, string> = {
  "session-complete": "Focus Session Complete!",
  "break-over": "Break is Over",
  "focus-start": "Time to Focus",
  "focus-complete": "Focus time's up!",
};

function getSettings() {
  return useSettingsStore.getState().settings;
}

export async function playChime(): Promise<void> {
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

  if (settings.respectDnd) {
    try {
      const dndEnabled = await invoke("is_dnd_enabled");
      if (dndEnabled) return;
    } catch {}
  }

  const tauri = await isTauri();
  if (tauri) {
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
