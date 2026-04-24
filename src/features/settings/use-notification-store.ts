import { create } from "zustand";
import { isTauri } from "@/lib/tauri";

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
      const tauri = await isTauri();
      if (!tauri) {
        set({ status: "unavailable", checking: false });
        return;
      }

      const { isPermissionGranted } =
        await import("@tauri-apps/plugin-notification");
      const granted = await isPermissionGranted();
      const newStatus: NotificationStatus = granted ? "granted" : "denied";
      set({
        status: newStatus,
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
      const tauri = await isTauri();
      if (!tauri) {
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
        console.log(
          "[Notification] Permission not granted, attempting to send to trigger OS dialog...",
        );

        try {
          await sendNotification({
            title: "Kairos",
            body:
              "Notifications enabled! You'll receive alerts when your timer ends.",
          });

          granted = true;
          console.log("[Notification] Test notification sent successfully!");
        } catch (sendErr) {
          console.error("[Notification] Send failed:", sendErr);

          try {
            const result = await requestPermission();
            granted = result === "granted";
            console.log(
              "[Notification] requestPermission result:",
              result,
            );
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
