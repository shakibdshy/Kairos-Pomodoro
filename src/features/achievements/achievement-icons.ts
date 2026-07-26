import { Award, CalendarDays, Flame, Sun, Trophy } from "lucide-react";
import type { AchievementIcon } from "./achievement-catalog";

export const ACHIEVEMENT_ICONS: Record<AchievementIcon, typeof Award> = {
  award: Award,
  calendar: CalendarDays,
  flame: Flame,
  sun: Sun,
  trophy: Trophy,
};
