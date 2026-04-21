import { create } from "zustand";
import type { Settings } from "@/features/settings/settings-types";
import { getSetting, setSetting } from "@/lib/db";
import {
  DEFAULT_WORK_SEC,
  DEFAULT_SHORT_BREAK_SEC,
  DEFAULT_LONG_BREAK_SEC,
  POMOS_BEFORE_LONG_BREAK,
  HOTKEY_DEFAULT,
} from "@/lib/constants";

const DEFAULTS: Settings = {
  workDuration: DEFAULT_WORK_SEC,
  shortBreakDuration: DEFAULT_SHORT_BREAK_SEC,
  longBreakDuration: DEFAULT_LONG_BREAK_SEC,
  pomosBeforeLongBreak: POMOS_BEFORE_LONG_BREAK,
  autoStartBreaks: true,
  hotkey: HOTKEY_DEFAULT,
  soundEnabled: true,
  respectDnd: true,
};

async function loadSetting<K extends keyof Settings>(
  key: K,
): Promise<Settings[K]> {
  const raw = await getSetting(key);
  if (raw === null) return DEFAULTS[key];
  if (typeof DEFAULTS[key] === "boolean")
    return (raw === "true") as Settings[K];
  if (typeof DEFAULTS[key] === "number") return Number(raw) as Settings[K];
  return raw as Settings[K];
}

interface SettingsStore {
  settings: Settings;
  loaded: boolean;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: DEFAULTS,
  loaded: false,

  loadSettings: async () => {
    const keys = Object.keys(DEFAULTS) as (keyof Settings)[];
    const entries = await Promise.all(
      keys.map(async (key) => [key, await loadSetting(key)] as const),
    );
    const loaded = Object.fromEntries(entries) as unknown as Settings;
    set({ settings: loaded, loaded: true });
  },

  updateSetting: async <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    await setSetting(key, String(value));
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
  },
}));
