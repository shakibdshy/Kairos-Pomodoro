import { create } from "zustand";

interface UIStore {
  isFullscreenFocus: boolean;
  setFullscreenFocus: (active: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isFullscreenFocus: false,
  setFullscreenFocus: (active) => set({ isFullscreenFocus: active }),
}));
