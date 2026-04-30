import { describe, it, expect } from "vitest";
import {
  formatSeconds,
  getPhaseColor,
  getPhaseBg,
  getPhaseLabel,
  formatTimeAmPm,
} from "@/lib/time";

describe("formatSeconds", () => {
  it("formats zero seconds", () => {
    expect(formatSeconds(0)).toBe("00:00");
  });

  it("formats seconds only", () => {
    expect(formatSeconds(45)).toBe("00:45");
  });

  it("formats minutes only", () => {
    expect(formatSeconds(120)).toBe("02:00");
  });

  it("formats minutes and seconds", () => {
    expect(formatSeconds(1500)).toBe("25:00");
  });

  it("formats mixed minutes and seconds", () => {
    expect(formatSeconds(125)).toBe("02:05");
  });

  it("formats large values", () => {
    expect(formatSeconds(3661)).toBe("61:01");
  });
});

describe("getPhaseColor", () => {
  it("returns correct color for work", () => {
    expect(getPhaseColor("work")).toBe("text-sahara-primary");
  });

  it("returns correct color for short_break", () => {
    expect(getPhaseColor("short_break")).toBe("text-sahara-text-secondary");
  });

  it("returns correct color for long_break", () => {
    expect(getPhaseColor("long_break")).toBe("text-sahara-text-muted");
  });
});

describe("getPhaseBg", () => {
  it("returns correct bg for work", () => {
    expect(getPhaseBg("work")).toBe("bg-sahara-primary");
  });

  it("returns correct bg for short_break", () => {
    expect(getPhaseBg("short_break")).toBe("bg-sahara-card");
  });

  it("returns correct bg for long_break", () => {
    expect(getPhaseBg("long_break")).toBe("bg-sahara-card");
  });
});

describe("getPhaseLabel", () => {
  it("returns correct label for work", () => {
    expect(getPhaseLabel("work")).toBe("Focus");
  });

  it("returns correct label for short_break", () => {
    expect(getPhaseLabel("short_break")).toBe("Short Break");
  });

  it("returns correct label for long_break", () => {
    expect(getPhaseLabel("long_break")).toBe("Long Break");
  });
});

describe("formatTimeAmPm", () => {
  it("formats morning time", () => {
    const date = new Date(2026, 0, 1, 9, 30);
    expect(formatTimeAmPm(date)).toBe("9:30AM");
  });

  it("formats afternoon time", () => {
    const date = new Date(2026, 0, 1, 14, 5);
    expect(formatTimeAmPm(date)).toBe("2:05PM");
  });

  it("formats midnight", () => {
    const date = new Date(2026, 0, 1, 0, 0);
    expect(formatTimeAmPm(date)).toBe("12:00AM");
  });

  it("formats noon", () => {
    const date = new Date(2026, 0, 1, 12, 0);
    expect(formatTimeAmPm(date)).toBe("12:00PM");
  });

  it("pads single-digit minutes", () => {
    const date = new Date(2026, 0, 1, 3, 5);
    expect(formatTimeAmPm(date)).toBe("3:05AM");
  });
});
