import { describe, it, expect } from "vitest";
import { formatTime, formatDuration, formatTotalTime } from "@/lib/session-utils";

describe("formatDuration", () => {
  it("formats seconds only", () => {
    expect(formatDuration(45)).toBe("45s");
  });

  it("formats exact minutes", () => {
    expect(formatDuration(120)).toBe("2m");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(90)).toBe("1m 30s");
  });

  it("formats zero", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  it("formats large values", () => {
    expect(formatDuration(3661)).toBe("61m 1s");
  });
});

describe("formatTotalTime", () => {
  it("formats minutes only", () => {
    expect(formatTotalTime(1500)).toBe("25m");
  });

  it("formats hours and minutes", () => {
    expect(formatTotalTime(3661)).toBe("1h 1m");
  });

  it("formats exact hours", () => {
    expect(formatTotalTime(7200)).toBe("2h 0m");
  });

  it("formats zero", () => {
    expect(formatTotalTime(0)).toBe("0m");
  });

  it("formats under an hour", () => {
    expect(formatTotalTime(1800)).toBe("30m");
  });
});

describe("formatTime", () => {
  it("formats a date string", () => {
    const result = formatTime("2026-01-15T14:30:00");
    expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
  });
});
