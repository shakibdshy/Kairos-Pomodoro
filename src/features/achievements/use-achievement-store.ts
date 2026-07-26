import { create } from "zustand";
import {
  getPendingAchievementAnnouncements,
  markBadgeAnnounced,
  reconcileAchievements,
} from "./achievement-service";
import type { AchievementDisplay } from "./achievement-catalog";

interface AchievementStore {
  queue: AchievementDisplay[];
  loaded: boolean;
  loadPending: () => Promise<void>;
  enqueue: (achievements: AchievementDisplay[]) => void;
  dismissCurrent: () => Promise<void>;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  queue: [],
  loaded: false,

  loadPending: async () => {
    try {
      // Existing sessions should unlock badges in the gallery without showing
      // a surprise burst of historical popups after an app update.
      await reconcileAchievements(null, false);
      const pending = await getPendingAchievementAnnouncements();
      set((state) => {
        const queuedIds = new Set(state.queue.map((achievement) => achievement.id));
        const additions = pending.filter((achievement) => !queuedIds.has(achievement.id));
        return { queue: [...state.queue, ...additions], loaded: true };
      });
    } catch (error) {
      console.error("[Achievements] Failed to load pending announcements:", error);
      set({ loaded: true });
    }
  },

  enqueue: (achievements) => {
    if (achievements.length === 0) return;
    set((state) => {
      const queuedIds = new Set(state.queue.map((achievement) => achievement.id));
      const additions = achievements.filter((achievement) => !queuedIds.has(achievement.id));
      return additions.length > 0 ? { queue: [...state.queue, ...additions] } : state;
    });
  },

  dismissCurrent: async () => {
    const current = get().queue[0];
    if (!current) return;
    try {
      await markBadgeAnnounced(current.id);
    } catch (error) {
      console.error(`[Achievements] Failed to mark ${current.id} announced:`, error);
      return;
    }
    set((state) => ({
      queue: state.queue.filter((achievement) => achievement.id !== current.id),
    }));
  },
}));
