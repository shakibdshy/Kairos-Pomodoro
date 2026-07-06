import { describe, it, expect } from "vitest";
import {
  BACKUP_APP_ID,
  BACKUP_FORMAT_VERSION,
  BACKUP_SCHEMA_VERSION,
  exportBackup,
  importBackup,
  resolveValue,
  type BackupFile,
} from "@/lib/backup";

// The validation logic lives inside importBackup via a private `validateBackup`.
// Since export/import short-circuit when not in Tauri, we test the exported
// constants and the BackupFile shape contract here. The DB-mock-based behavior
// is exercised in the playwright/e2e layer.

describe("backup constants", () => {
  it("exposes a stable app id", () => {
    expect(BACKUP_APP_ID).toBe("kairos");
  });

  it("exposes a numeric format version", () => {
    expect(typeof BACKUP_FORMAT_VERSION).toBe("number");
    expect(BACKUP_FORMAT_VERSION).toBeGreaterThan(0);
  });

  it("exposes the current schema version", () => {
    // Must stay in sync with the targetVersion in schema.ts.
    expect(BACKUP_SCHEMA_VERSION).toBe(4);
  });
});

describe("exportBackup / importBackup outside Tauri", () => {
  it("exportBackup refuses when not in desktop mode", async () => {
    const res = await exportBackup();
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/desktop/i);
  });

  it("importBackup refuses when not in desktop mode", async () => {
    const res = await importBackup();
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/desktop/i);
  });
});

describe("BackupFile shape contract", () => {
  it("a well-formed payload matches the expected structure", () => {
    const payload: BackupFile = {
      app: BACKUP_APP_ID,
      formatVersion: BACKUP_FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      schemaVersion: BACKUP_SCHEMA_VERSION,
      data: {
        categories: [{ id: 1, name: "Deep Work", color: "#c2652a", created_at: "2024-01-01" }],
        tasks: [],
        sessions: [],
        presets: [],
        settings: [],
        time_blocks: [],
        journal_entries: [],
      },
    };
    expect(payload.app).toBe("kairos");
    expect(payload.formatVersion).toBe(BACKUP_FORMAT_VERSION);
    expect(Object.keys(payload.data)).toHaveLength(7);
    expect(payload.data.categories).toHaveLength(1);
  });
});

describe("resolveValue (restore NULL handling)", () => {
  it("returns the raw value when present", () => {
    expect(resolveValue("tasks", "name", "Write report")).toBe("Write report");
    expect(resolveValue("tasks", "estimated_pomos", 5)).toBe(5);
  });

  it("applies NOT NULL defaults for tasks when value is null/undefined", () => {
    // A task row with NULL archived would be hidden by getTasks()'s
    // `WHERE archived = 0` filter — resolveValue must default it to 0.
    expect(resolveValue("tasks", "archived", null)).toBe(0);
    expect(resolveValue("tasks", "archived", undefined)).toBe(0);
    expect(resolveValue("tasks", "estimated_pomos", null)).toBe(1);
    expect(resolveValue("tasks", "completed_pomos", undefined)).toBe(0);
    expect(resolveValue("tasks", "name", undefined)).toBe("Untitled");
  });

  it("applies defaults for sessions and categories", () => {
    expect(resolveValue("sessions", "phase", null)).toBe("work");
    expect(resolveValue("sessions", "duration_sec", undefined)).toBe(0);
    expect(resolveValue("categories", "name", null)).toBe("Untitled");
    expect(resolveValue("categories", "color", undefined)).toBe("#c2652a");
  });

  it("falls back to null for columns with no configured default", () => {
    expect(resolveValue("tasks", "project", null)).toBeNull();
    expect(resolveValue("tasks", "priority", undefined)).toBeNull();
    expect(resolveValue("sessions", "notes", null)).toBeNull();
  });

  it("returns null for unknown tables", () => {
    expect(resolveValue("unknown_table", "anything", undefined)).toBeNull();
    expect(resolveValue("unknown_table", "anything", "x")).toBe("x");
  });
});
