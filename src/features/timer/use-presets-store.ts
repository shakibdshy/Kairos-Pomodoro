import { create } from "zustand";
import { getPresets, addPreset, updatePreset, deletePreset, type TimerPreset } from "@/lib/db";
import { useTimerStore } from "@/features/timer/use-timer-store";

interface PresetsStore {
  presets: TimerPreset[];
  loaded: boolean;
  error: string | null;
  loadPresets: () => Promise<void>;
  savePreset: (name: string) => Promise<void>;
  editPreset: (id: number, name: string) => Promise<void>;
  applyPreset: (preset: TimerPreset) => void;
  removePreset: (id: number) => Promise<void>;
}

export const usePresetsStore = create<PresetsStore>((set, get) => ({
  presets: [],
  loaded: false,
  error: null,

  loadPresets: async () => {
    try {
      const presets = await getPresets();
      set({ presets, loaded: true, error: null });
    } catch (err) {
      console.error("[PresetsStore] Failed to load presets:", err);
      set({ loaded: true, error: String(err) });
    }
  },

  savePreset: async (name: string) => {
    try {
      const timer = useTimerStore.getState();
      const newPreset = {
        name,
        work_duration: timer.durations.work,
        short_break_duration: timer.durations.short,
        long_break_duration: timer.durations.long,
        pomos_before_long_break: 4,
      };
      await addPreset(newPreset);
      await get().loadPresets();
    } catch (err) {
      console.error("[PresetsStore] Failed to save preset:", err);
      set({ error: String(err) });
    }
  },

  editPreset: async (id: number, name: string) => {
    try {
      const timer = useTimerStore.getState();
      await updatePreset(id, {
        name,
        work_duration: timer.durations.work,
        short_break_duration: timer.durations.short,
        long_break_duration: timer.durations.long,
      });
      await get().loadPresets();
    } catch (err) {
      console.error("[PresetsStore] Failed to edit preset:", err);
      set({ error: String(err) });
    }
  },

  applyPreset: (preset: TimerPreset) => {
    const timer = useTimerStore.getState();
    timer.setDurations(
      preset.work_duration,
      preset.short_break_duration,
      preset.long_break_duration,
    );
  },

  removePreset: async (id: number) => {
    try {
      await deletePreset(id);
      await get().loadPresets();
    } catch (err) {
      console.error("[PresetsStore] Failed to remove preset:", err);
      set({ error: String(err) });
    }
  },
}));
