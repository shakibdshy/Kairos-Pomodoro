import { describe, it, expect } from "vitest";
import { fromLocalInput, toLocalInput } from "@/components/base/time-block-form";

/**
 * These conversions use the JS Date local getters, so the exact stored string
 * depends on the runtime timezone. But the *invariant* we care about — and the
 * thing that was broken (Bug 1) — is that the hour the user picked is the hour
 * that comes back, with no UTC drift and no trailing `Z`. We assert that
 * invariant rather than a TZ-pinned literal.
 */
describe("time-block-form datetime conversion", () => {
  it("fromLocalInput emits local-naive 'yyyy-MM-dd HH:mm:ss' with no UTC marker", () => {
    const out = fromLocalInput("2026-07-05T12:30");
    // No trailing Z — storing local-naive is what keeps the timeline consistent.
    expect(out.endsWith("Z")).toBe(false);
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it("fromLocalInput preserves the hour:minute the user picked (regression for Bug 1)", () => {
    // Previously this returned a UTC ISO string; in any non-UTC zone the hour
    // shifted (12:30 → 06:30Z at UTC+6), so the block rendered on the wrong row.
    const out = fromLocalInput("2026-07-05T12:30");
    expect(out).toContain("12:30:00");
  });

  it("toLocalInput reads a local-naive value back into datetime-local format", () => {
    const stored = "2026-07-05 12:30:00";
    const back = toLocalInput(new Date(stored));
    expect(back).toBe("2026-07-05T12:30");
  });

  it("round-trips through fromLocalInput → toLocalInput without hour drift", () => {
    const picked = "2026-07-05T23:30"; // late-evening edge case
    const stored = fromLocalInput(picked);
    const back = toLocalInput(new Date(stored));
    expect(back).toBe(picked);
  });
});
