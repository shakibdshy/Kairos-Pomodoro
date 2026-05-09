export type ThemeMode = "light" | "dark" | "system";

export interface Settings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  pomosBeforeLongBreak: number;
  autoStartBreaks: boolean;
  hotkey: string;
  soundEnabled: boolean;
  theme: ThemeMode;
  timerStyle: "solid" | "zigzag";
}
