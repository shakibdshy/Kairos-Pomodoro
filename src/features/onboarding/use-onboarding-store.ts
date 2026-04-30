import { create } from "zustand";
import { getSetting, setSetting } from "@/lib/db";

interface OnboardingStore {
  complete: boolean | null;
  loaded: boolean;
  check: () => Promise<void>;
  markComplete: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  complete: null,
  loaded: false,

  check: async () => {
    try {
      const value = await getSetting("onboarding_complete");
      set({ complete: value === "true", loaded: true });
    } catch (err) {
      console.error("[OnboardingStore] Failed to check onboarding status:", err);
      set({ complete: false, loaded: true });
    }
  },

  markComplete: async () => {
    await setSetting("onboarding_complete", "true");
    set({ complete: true, loaded: true });
  },
}));
