import { create } from "zustand";
import { getPresets, addPreset, deletePreset, type TimerPreset } from "@/lib/db";
import { useTimerStore } from "@/features/timer/use-timer-store";

interface PresetsStore {
  presets: TimerPreset[];
  loaded: boolean;
  loadPresets: () => Promise<void>;
  savePreset: (name: string) => Promise<void>;
  applyPreset: (preset: TimerPreset) => void;
  removePreset: (id: number) => Promise<void>;
}

export const usePresetsStore = create<PresetsStore>((set, get) => ({
  presets: [],
  loaded: false,

  loadPresets: async () => {
    const presets = await getPresets();
    set({ presets, loaded: true });
  },

  savePreset: async (name: string) => {
    const timer = useTimerStore.getState();
    const newPreset = {
      name,
      work_duration: timer.durations.work,
      short_break_duration: timer.durations.short,
      long_break_duration: timer.durations.long,
      pomos_before_long_break: 4, // Defaulting or could pull from settings if added
    };
    await addPreset(newPreset);
    await get().loadPresets();
  },

  applyPreset: (preset: TimerPreset) => {
    const timer = useTimerStore.getState();
    timer.setDurations(
      preset.work_duration,
      preset.short_break_duration,
      preset.long_break_duration
    );
  },

  removePreset: async (id: number) => {
    await deletePreset(id);
    await get().loadPresets();
  },
}));
