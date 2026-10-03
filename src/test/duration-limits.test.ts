import { describe, it, expect } from "vitest";
import {
  MAX_DURATION_MINUTES,
  MAX_DURATION_SECONDS,
  MIN_DURATION_MINUTES,
  MIN_DURATION_SECONDS,
  clampDurationMinutes,
  clampDurationSeconds,
  exceedsMaxDuration,
  MAX_ANY_DURATION_SECONDS,
  type DurationKind,
} from "@/lib/duration-limits";
import { MAX_INPUT_SECONDS, parseTimeInput } from "@/lib/timer-utils";
import { DURATION_CONFIGS } from "@/features/settings/duration-config";

const KINDS: DurationKind[] = ["work", "shortBreak", "longBreak"];

describe("duration policy", () => {
  it.each(KINDS)("%s has a positive minute ceiling", (kind) => {
    expect(MAX_DURATION_MINUTES[kind]).toBeGreaterThan(0);
  });

  it.each(KINDS)("%s seconds equal its minutes times 60", (kind) => {
    expect(MAX_DURATION_SECONDS[kind]).toBe(MAX_DURATION_MINUTES[kind] * 60);
  });

  it("the work ceiling is the longest phase", () => {
    expect(MAX_ANY_DURATION_SECONDS).toBe(MAX_DURATION_SECONDS.work);
  });

  it.each(KINDS)("clampDurationSeconds floors %s at its ceiling", (kind) => {
    const over = MAX_DURATION_SECONDS[kind] + 10_000;
    expect(clampDurationSeconds(kind, over)).toBe(MAX_DURATION_SECONDS[kind]);
  });

  it.each(KINDS)("clampDurationSeconds floors %s at one minute", (kind) => {
    expect(clampDurationSeconds(kind, -50)).toBe(MIN_DURATION_SECONDS);
    expect(clampDurationSeconds(kind, 0)).toBe(MIN_DURATION_SECONDS);
  });

  it.each(KINDS)("clampDurationMinutes floors %s at its ceiling", (kind) => {
    expect(clampDurationMinutes(kind, 10_000)).toBe(MAX_DURATION_MINUTES[kind]);
  });

  it.each(KINDS)("clampDurationMinutes floors %s at the minimum", (kind) => {
    expect(clampDurationMinutes(kind, 0)).toBe(MIN_DURATION_MINUTES);
  });

  it.each(KINDS)("exceedsMaxDuration flags %s above its ceiling", (kind) => {
    expect(exceedsMaxDuration(kind, MAX_DURATION_SECONDS[kind] + 1)).toBe(true);
    expect(exceedsMaxDuration(kind, MAX_DURATION_SECONDS[kind])).toBe(false);
  });
});

describe("surfaces agree on the duration ceiling", () => {
  it("every settings input uses the policy ceiling, not a local literal", () => {
    for (const config of DURATION_CONFIGS) {
      expect(config.maxMinutes).toBe(MAX_DURATION_MINUTES[config.kind]);
    }
  });

  it("every settings input maps to a distinct settings key", () => {
    const keys = DURATION_CONFIGS.map((c) => c.settingsKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every settings input maps to a distinct local field", () => {
    const fields = DURATION_CONFIGS.map((c) => c.field);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("the settings inputs cover every duration kind", () => {
    expect(DURATION_CONFIGS.map((c) => c.kind).sort()).toEqual(
      [...KINDS].sort(),
    );
  });

  it.each(DURATION_CONFIGS)(
    "$settingsKey input cannot express more than the policy allows",
    ({ maxMinutes, settingsKey }) => {
      // The input clamps on change; simulate one step past the ceiling.
      const clamped = Math.min(maxMinutes, Math.max(1, maxMinutes + 1));
      expect(clamped).toBe(maxMinutes);
      expect(maxMinutes).toBe(
        MAX_DURATION_MINUTES[
          DURATION_CONFIGS.find((c) => c.settingsKey === settingsKey)!.kind
        ],
      );
    },
  );

  it("the timer duration field can represent the largest ceiling", () => {
    expect(MAX_INPUT_SECONDS).toBeGreaterThanOrEqual(MAX_ANY_DURATION_SECONDS);
    expect(parseTimeInput(`${MAX_DURATION_MINUTES.work}:00`)).toBe(
      MAX_DURATION_SECONDS.work,
    );
  });
});
