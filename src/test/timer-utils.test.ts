import { describe, it, expect } from "vitest";
import {
  MAX_INPUT_SECONDS,
  formatEditableValueFromSeconds,
  formatEditingDisplay,
  parseTimeInput,
  sanitizeTimeInput,
} from "@/lib/timer-utils";

describe("formatEditableValueFromSeconds", () => {
  it("formats seconds below a minute as bare minutes", () => {
    expect(formatEditableValueFromSeconds(1500)).toBe("25");
  });

  it("formats a whole-minute duration with seconds omitted", () => {
    expect(formatEditableValueFromSeconds(7200)).toBe("120");
  });

  it("renders a 120 minute duration as 120:00, not truncated to 99:59", () => {
    expect(formatEditingDisplay(formatEditableValueFromSeconds(7200))).toBe(
      "120:00",
    );
  });

  it("does not truncate a duration beyond the previous 99 minute ceiling", () => {
    const rendered = formatEditingDisplay(
      formatEditableValueFromSeconds(MAX_INPUT_SECONDS + 1),
    );
    expect(rendered).not.toBe("99:59");
  });

  it("still floors negative durations at zero", () => {
    expect(formatEditableValueFromSeconds(-10)).toBe("00");
  });

  it("formats the longest representable duration within six characters", () => {
    const longest = formatEditingDisplay(
      formatEditableValueFromSeconds(MAX_INPUT_SECONDS),
    );
    expect(longest).toBe("999:59");
    expect(longest).toHaveLength(6);
  });
});

describe("formatEditingDisplay", () => {
  it("renders an empty value as 00:00", () => {
    expect(formatEditingDisplay("")).toBe("00:00");
  });

  it("renders bare minutes as mm:00", () => {
    expect(formatEditingDisplay("25")).toBe("25:00");
  });

  it("pads minutes to two digits", () => {
    expect(formatEditingDisplay("5:30")).toBe("05:30");
  });

  it("does not widen a three digit minute value", () => {
    expect(formatEditingDisplay("120")).toBe("120:00");
  });
});

describe("parseTimeInput", () => {
  it("returns zero for an empty value", () => {
    expect(parseTimeInput("")).toBe(0);
  });

  it("parses bare minutes as seconds", () => {
    expect(parseTimeInput("25")).toBe(1500);
  });

  it("parses a minutes and seconds pair", () => {
    expect(parseTimeInput("25:30")).toBe(1530);
  });

  it("parses a 120 minute duration without clamping it", () => {
    expect(parseTimeInput("120:00")).toBe(7200);
  });

  it("round-trips a 120 minute duration through format and parse unchanged", () => {
    const formatted = formatEditableValueFromSeconds(7200);
    expect(parseTimeInput(formatted)).toBe(7200);
  });

  it("round-trips the longest representable duration unchanged", () => {
    const formatted = formatEditableValueFromSeconds(MAX_INPUT_SECONDS);
    expect(parseTimeInput(formatted)).toBe(MAX_INPUT_SECONDS);
  });
});

describe("sanitizeTimeInput", () => {
  it("strips non-numeric characters", () => {
    expect(sanitizeTimeInput("1a2b")).toBe("12");
  });

  it("keeps a minutes and seconds pair", () => {
    expect(sanitizeTimeInput("1:30")).toBe("1:30");
  });

  it("allows a three digit minute value so long sessions can be typed", () => {
    expect(sanitizeTimeInput("120:00")).toBe("120:00");
  });

  it("caps the seconds part at two digits", () => {
    expect(sanitizeTimeInput("120:123")).toBe("120:12");
  });
});
