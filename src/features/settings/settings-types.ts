export type ThemeMode = "light" | "dark" | "system";

/** Named color palette presets. Sahara is the default. */
export type ThemePreset = "sahara" | "forest" | "ocean" | "mono";

export interface Settings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  pomosBeforeLongBreak: number;
  autoStartBreaks: boolean;
  hotkey: string;
  soundEnabled: boolean;
  theme: ThemeMode;
  themePreset: ThemePreset;
  timerStyle: "solid" | "zigzag";
}
