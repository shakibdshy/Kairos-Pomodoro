import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import {
  DEFAULT_WORK_SEC,
  DEFAULT_SHORT_BREAK_SEC,
  DEFAULT_LONG_BREAK_SEC,
  POMOS_BEFORE_LONG_BREAK,
  HOTKEY_DEFAULT,
} from "@/lib/constants";

vi.mock("@/lib/db", () => {
  const store: Record<string, string> = {};
  return {
    getSetting: vi.fn((key: string) => Promise.resolve(store[key] ?? null)),
    setSetting: vi.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  useSettingsStore.setState({
    settings: {
      workDuration: DEFAULT_WORK_SEC,
      shortBreakDuration: DEFAULT_SHORT_BREAK_SEC,
      longBreakDuration: DEFAULT_LONG_BREAK_SEC,
      pomosBeforeLongBreak: POMOS_BEFORE_LONG_BREAK,
      autoStartBreaks: false,
      hotkey: HOTKEY_DEFAULT,
      soundEnabled: true,
      respectDnd: true,
      theme: "system",
    },
    loaded: false,
  });
});

describe("useSettingsStore", () => {
  describe("initial state", () => {
    it("has correct defaults", () => {
      const { settings, loaded } = useSettingsStore.getState();
      expect(settings.workDuration).toBe(DEFAULT_WORK_SEC);
      expect(settings.shortBreakDuration).toBe(DEFAULT_SHORT_BREAK_SEC);
      expect(settings.longBreakDuration).toBe(DEFAULT_LONG_BREAK_SEC);
      expect(settings.autoStartBreaks).toBe(false);
      expect(settings.hotkey).toBe(HOTKEY_DEFAULT);
      expect(settings.soundEnabled).toBe(true);
      expect(settings.respectDnd).toBe(true);
      expect(settings.theme).toBe("system");
      expect(loaded).toBe(false);
    });
  });

  describe("loadSettings", () => {
    it("sets loaded to true after loading", async () => {
      await useSettingsStore.getState().loadSettings();
      expect(useSettingsStore.getState().loaded).toBe(true);
    });

    it("uses defaults when db returns null", async () => {
      await useSettingsStore.getState().loadSettings();
      const { settings } = useSettingsStore.getState();
      expect(settings.workDuration).toBe(DEFAULT_WORK_SEC);
      expect(settings.autoStartBreaks).toBe(false);
    });

    it("parses boolean settings from string", async () => {
      const { getSetting } = await import("@/lib/db");
      vi.mocked(getSetting).mockImplementation((key: string) => {
        if (key === "autoStartBreaks") return Promise.resolve("true");
        if (key === "soundEnabled") return Promise.resolve("false");
        return Promise.resolve(null);
      });

      await useSettingsStore.getState().loadSettings();
      const { settings } = useSettingsStore.getState();
      expect(settings.autoStartBreaks).toBe(true);
      expect(settings.soundEnabled).toBe(false);
    });

    it("parses number settings from string", async () => {
      const { getSetting } = await import("@/lib/db");
      vi.mocked(getSetting).mockImplementation((key: string) => {
        if (key === "workDuration") return Promise.resolve("1800");
        return Promise.resolve(null);
      });

      await useSettingsStore.getState().loadSettings();
      expect(useSettingsStore.getState().settings.workDuration).toBe(1800);
    });
  });

  describe("updateSetting", () => {
    it("persists and updates state", async () => {
      const { setSetting } = await import("@/lib/db");
      await useSettingsStore.getState().updateSetting("workDuration", 1800);
      expect(useSettingsStore.getState().settings.workDuration).toBe(1800);
      expect(setSetting).toHaveBeenCalledWith("workDuration", "1800");
    });

    it("converts boolean to string for storage", async () => {
      const { setSetting } = await import("@/lib/db");
      await useSettingsStore.getState().updateSetting("autoStartBreaks", true);
      expect(setSetting).toHaveBeenCalledWith("autoStartBreaks", "true");
      expect(useSettingsStore.getState().settings.autoStartBreaks).toBe(true);
    });

    it("updates theme setting", async () => {
      await useSettingsStore.getState().updateSetting("theme", "dark");
      expect(useSettingsStore.getState().settings.theme).toBe("dark");
    });
  });
});
