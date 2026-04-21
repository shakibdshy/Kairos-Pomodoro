import { create } from "zustand";

export type NotificationStatus = "unknown" | "granted" | "denied" | "unavailable";

interface NotificationStore {
  status: NotificationStatus;
  checking: boolean;
  error: string | null;
  checkPermission: () => Promise<void>;
  requestPermission: () => Promise<NotificationStatus>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  status: "unknown",
  checking: false,
  error: null,

  checkPermission: async () => {
    set({ checking: true, error: null });
    try {
      if (typeof window === "undefined" || !(window as any).__TAURI__) {
        set({ status: "denied", checking: false });
        return;
      }

      const { isPermissionGranted } =
        await import("@tauri-apps/plugin-notification");
      const granted = await isPermissionGranted();
      set({
        status: granted ? "granted" : "denied",
        checking: false,
      });
    } catch (e) {
      console.error("[Notification] Permission check failed:", e);
      set({
        status: "denied",
        checking: false,
        error: String(e),
      });
    }
  },

  requestPermission: async () => {
    set({ checking: true, error: null });
    try {
      if (typeof window === "undefined" || !(window as any).__TAURI__) {
        set({
          status: "unavailable",
          checking: false,
          error: null,
        });
        return "unavailable";
      }

      const { isPermissionGranted, requestPermission, sendNotification } =
        await import("@tauri-apps/plugin-notification");

      let granted = await isPermissionGranted();

      if (!granted) {
        // On macOS, requestPermission() doesn't show a system dialog.
        // We must actually TRY sending a notification to trigger the OS dialog.
        console.log(
          "[Notification] Permission not granted, attempting to send to trigger OS dialog...",
        );

        try {
          // This call triggers the macOS system permission dialog
          await sendNotification({
            title: "Kairos",
            body: "Notifications enabled! You'll receive alerts when your timer ends.",
          });

          // If we got here without error, the user approved
          granted = true;
          console.log("[Notification] Test notification sent successfully!");
        } catch (sendErr) {
          // Sending failed - might be permission denied
          console.error("[Notification] Send failed:", sendErr);

          // Try requestPermission as fallback (some platforms use this)
          try {
            const result = await requestPermission();
            granted = result === "granted";
            console.log("[Notification] requestPermission result:", result);
          } catch {
            granted = false;
          }
        }
      }

      const newStatus: NotificationStatus = granted ? "granted" : "denied";
      set({ status: newStatus, checking: false });
      return newStatus;
    } catch (e) {
      console.error("[Notification] Request failed:", e);
      set({
        status: "denied",
        checking: false,
        error: String(e),
      });
      return "denied";
    }
  },

  reset: () => set({ status: "unknown", checking: false, error: null }),
}));
