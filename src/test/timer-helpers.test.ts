import { describe, it, expect } from "vitest";
import {
  getNextPhase,
  resolveLongBreakCadence,
} from "@/features/timer/timer-helpers";
import { POMOS_BEFORE_LONG_BREAK } from "@/lib/constants";

const DURATIONS = { work: 1500, short: 300, long: 900 };

describe("resolveLongBreakCadence", () => {
  it("accepts a positive integer setting", () => {
    expect(resolveLongBreakCadence(3)).toBe(3);
  });

  it("floors a fractional setting", () => {
    expect(resolveLongBreakCadence(2.7)).toBe(2);
  });

  it.each([0, -1, Number.NaN, null, undefined, "4", {}])(
    "falls back to the default for %p",
    (value) => {
      expect(resolveLongBreakCadence(value)).toBe(POMOS_BEFORE_LONG_BREAK);
    },
  );
});

describe("getNextPhase long break cadence", () => {
  it("defaults to the constant cadence when none is given", () => {
    const nth = POMOS_BEFORE_LONG_BREAK;
    expect(getNextPhase("work", nth, DURATIONS).phase).toBe("long_break");
    expect(getNextPhase("work", nth - 1, DURATIONS).phase).toBe("short_break");
  });

  it("honours a configured cadence of 2", () => {
    expect(getNextPhase("work", 2, DURATIONS, 2).phase).toBe("long_break");
    expect(getNextPhase("work", 1, DURATIONS, 2).phase).toBe("short_break");
  });

  it("honours a configured cadence of 3", () => {
    expect(getNextPhase("work", 3, DURATIONS, 3).phase).toBe("long_break");
    expect(getNextPhase("work", 2, DURATIONS, 3).phase).toBe("short_break");
  });

  it("does not give a long break at the default count under a larger cadence", () => {
    expect(
      getNextPhase("work", POMOS_BEFORE_LONG_BREAK, DURATIONS, 6).phase,
    ).toBe("short_break");
    expect(getNextPhase("work", 6, DURATIONS, 6).phase).toBe("long_break");
  });

  it("falls back to the default cadence when the setting is unusable", () => {
    expect(getNextPhase("work", 0, DURATIONS, 0).phase).toBe("long_break");
    expect(
      getNextPhase("work", POMOS_BEFORE_LONG_BREAK, DURATIONS, Number.NaN)
        .phase,
    ).toBe("long_break");
  });

  it("returns the matching duration for the chosen break", () => {
    expect(getNextPhase("work", 2, DURATIONS, 2).duration).toBe(DURATIONS.long);
    expect(getNextPhase("work", 1, DURATIONS, 2).duration).toBe(
      DURATIONS.short,
    );
  });

  it("always returns to work after a break", () => {
    expect(getNextPhase("short_break", 2, DURATIONS, 2).phase).toBe("work");
    expect(getNextPhase("long_break", 2, DURATIONS, 2).phase).toBe("work");
  });
});
