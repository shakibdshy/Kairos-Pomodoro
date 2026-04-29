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
    const value = await getSetting("onboarding_complete");
    set({ complete: value === "true", loaded: true });
  },

  markComplete: async () => {
    await setSetting("onboarding_complete", "true");
    set({ complete: true });
  },
}));
