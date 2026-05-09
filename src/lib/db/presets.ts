import { getDb } from "./schema";

export interface TimerPreset {
  id: number;
  name: string;
  work_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  pomos_before_long_break: number;
  created_at: string;
}

export async function getPresets(): Promise<TimerPreset[]> {
  const db = await getDb();
  return db.select<TimerPreset[]>("SELECT * FROM presets ORDER BY created_at DESC");
}

export async function addPreset(preset: Omit<TimerPreset, "id" | "created_at">): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    "INSERT INTO presets (name, work_duration, short_break_duration, long_break_duration, pomos_before_long_break) VALUES ($1, $2, $3, $4, $5)",
    [preset.name, preset.work_duration, preset.short_break_duration, preset.long_break_duration, preset.pomos_before_long_break]
  );
  return result.lastInsertId ?? 0;
}

export async function updatePreset(
  id: number,
  preset: Pick<TimerPreset, "name" | "work_duration" | "short_break_duration" | "long_break_duration">,
): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE presets SET name = $1, work_duration = $2, short_break_duration = $3, long_break_duration = $4 WHERE id = $5",
    [preset.name, preset.work_duration, preset.short_break_duration, preset.long_break_duration, id],
  );
}

export async function deletePreset(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM presets WHERE id = $1", [id]);
}
