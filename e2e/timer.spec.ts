import { test, expect } from "./helpers";

test.describe("Timer", () => {
  test("shows default 25:00 timer with START FOCUS button", async ({
    page,
  }) => {
    await expect(
      page.getByRole("textbox", { name: "Set timer duration" }),
    ).toHaveValue("25:00");
    await expect(
      page.getByRole("button", { name: "START FOCUS" }),
    ).toBeVisible();
  });

  test("switches to Break phase", async ({ page }) => {
    await page.getByRole("button", { name: "Break" }).click();
    await expect(
      page.getByRole("textbox", { name: "Set timer duration" }),
    ).toHaveValue("05:00");
  });

  test("switches back to Focus phase from Break", async ({ page }) => {
    await page.getByRole("button", { name: "Break" }).click();
    await expect(
      page.getByRole("textbox", { name: "Set timer duration" }),
    ).toHaveValue("05:00");

    await page.getByRole("button", { name: "Focus", exact: true }).click();
    await expect(
      page.getByRole("textbox", { name: "Set timer duration" }),
    ).toHaveValue("25:00");
  });

  test("starts and pauses timer", async ({ page }) => {
    await page.getByRole("button", { name: "START FOCUS" }).click();
    await expect(page.getByRole("button", { name: "PAUSE" })).toBeVisible();

    await page.getByRole("button", { name: "PAUSE" }).click();
    await expect(page.getByRole("button", { name: "RESUME" })).toBeVisible();
  });

  test("abandon session returns to idle", async ({ page }) => {
    await page.getByRole("button", { name: "START FOCUS" }).click();
    await expect(page.getByRole("button", { name: "Abandon" })).toBeVisible();

    await page.getByRole("button", { name: "Abandon" }).click();
    await expect(
      page.getByRole("button", { name: "START FOCUS" }),
    ).toBeVisible();
  });

  test("finish after pause records focused time, not wall-clock time", async ({
    page,
  }) => {
    // 10-second session: focus ~2s, then paused ~3s. The recorded duration
    // must fall short of the wall-clock span by the paused gap — that is the
    // whole invariant, and it holds no matter how much jitter stretches the
    // running portion.
    const field = page.getByRole("textbox", { name: "Set timer duration" });
    await field.click();
    for (let i = 0; i < 6; i++) await field.press("Backspace");
    await field.pressSequentially("00:10", { delay: 20 });
    await field.blur();
    await expect(field).toHaveValue("00:10");

    const startedAt = Date.now();
    await page.getByRole("button", { name: "START FOCUS" }).click();
    await expect(page.getByRole("button", { name: "PAUSE" })).toBeVisible();

    await page.waitForTimeout(2_000);
    await page.getByRole("button", { name: "PAUSE" }).click();
    await page.waitForTimeout(3_000);

    await page.getByRole("button", { name: "Finish" }).click();
    // The summary must show the focused number, not the planned duration.
    await expect(page.getByText(/^[1-4]s$/, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Submit Session" }).click();
    await expect(
      page.getByRole("button", { name: "START FOCUS" }),
    ).toBeVisible();
    const wallClockSec = Math.round((Date.now() - startedAt) / 1000);

    const sessions = await page.evaluate(() => window.__dbMock.sessions());
    expect(sessions).toHaveLength(1);
    expect(sessions[0].phase).toBe("work");
    const focused = sessions[0].duration_sec as number;
    expect(focused).toBeGreaterThanOrEqual(1);
    // The ~3s paused gap must be excluded (1s slack covers tick rounding).
    expect(wallClockSec - focused).toBeGreaterThanOrEqual(2);
  });

  test("adjusting while paused stays frozen, honors the change on resume, and persists focused time", async ({
    page,
  }) => {
    // 10s session: focus ~2s, pause, +5min → ~5:08 remaining. The countdown
    // must stay frozen while paused (an adjustment must not restart it), tick
    // from the adjusted value after resume, and the persisted focused time
    // must cover only real focus — not the adjustment that never ran.
    const field = page.getByRole("textbox", { name: "Set timer duration" });
    await field.click();
    for (let i = 0; i < 6; i++) await field.press("Backspace");
    await field.pressSequentially("00:10", { delay: 20 });
    await field.blur();
    await expect(field).toHaveValue("00:10");

    await page.getByRole("button", { name: "START FOCUS" }).click();
    await expect(page.getByRole("button", { name: "PAUSE" })).toBeVisible();

    await page.waitForTimeout(2_000);
    await page.getByRole("button", { name: "PAUSE" }).click();
    await expect(page.getByRole("button", { name: "RESUME" })).toBeVisible();

    await page.getByRole("button", { name: "Add five minutes" }).click();
    const adjusted = page.getByText(/^05:0[789]$/);
    await expect(adjusted).toBeVisible();
    const frozenText = (await adjusted.textContent()) as string;

    // Still paused: the countdown must not have restarted after adjusting.
    await page.waitForTimeout(2_000);
    await expect(page.getByText(frozenText, { exact: true })).toBeVisible();

    // Resume: the countdown continues from the adjusted value (~05:06), not
    // from the worker's stale pre-adjustment value (which would be ~00:06).
    await page.getByRole("button", { name: "RESUME" }).click();
    await page.waitForTimeout(2_000);
    await expect(page.getByText(/^05:0[456]$/)).toBeVisible();
    await expect(page.getByText("00:06")).toBeHidden();

    await page.getByRole("button", { name: "Finish" }).click();
    await page.getByRole("button", { name: "Submit Session" }).click();
    await expect(
      page.getByRole("button", { name: "START FOCUS" }),
    ).toBeVisible();

    const sessions = await page.evaluate(() => window.__dbMock.sessions());
    const focused = sessions[0].duration_sec as number;
    // Real focus: ~2s before the pause plus ~2-3s after resume. A stale worker
    // would have recorded ~304s here by counting the paused +5min as focus.
    expect(focused).toBeLessThanOrEqual(6);
    expect(focused).toBeGreaterThanOrEqual(1);
  });

  test("phase selector buttons are disabled while running", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "START FOCUS" }).click();

    // Scoped by attribute, not by role: START FOCUS enters fullscreen focus,
    // which marks this whole region aria-hidden + inert, so a role query cannot
    // see it even though the buttons really are disabled.
    const phaseSelector = page.locator('[aria-label="Timer phase"] button');

    await expect(phaseSelector.nth(0)).toBeDisabled();
    await expect(phaseSelector.nth(1)).toBeDisabled();
  });

  test("reset button returns timer to idle", async ({ page }) => {
    await page.getByRole("button", { name: "Break" }).click();
    await page.getByRole("button", { name: "START FOCUS" }).click();
    await expect(page.getByRole("button", { name: "PAUSE" })).toBeVisible();

    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "START FOCUS" }),
    ).toBeVisible();
  });
});

test.describe("Presets over 99 minutes", () => {
  const durationField = (page: import("@playwright/test").Page) =>
    page.getByRole("textbox", { name: "Set timer duration" });

  test("applies a 120 minute preset without truncating the display", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Presets" }).click();
    await page.getByRole("button", { name: /DSA/ }).click();

    await expect(durationField(page)).toHaveValue("120:00");
  });

  test("idle value matches the running value after starting", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Presets" }).click();
    await page.getByRole("button", { name: /DSA/ }).click();
    await expect(durationField(page)).toHaveValue("120:00");

    await page.getByRole("button", { name: "START FOCUS" }).click();

    // The running countdown must still read 119 or 120 minutes — never the
    // truncated 99:59 the old ceiling produced.
    await expect(page.getByText(/^1(19|20):\d{2}$/).first()).toBeVisible();
  });

  test("focusing and blurring without typing preserves the preset duration", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Presets" }).click();
    await page.getByRole("button", { name: /DSA/ }).click();
    await expect(durationField(page)).toHaveValue("120:00");

    await durationField(page).click();
    await durationField(page).blur();

    await expect(durationField(page)).toHaveValue("120:00");
  });

  test("accepts a manually entered 120 minute duration", async ({ page }) => {
    const field = durationField(page);
    await field.click();
    // On focus the field swaps the display form ("25:00") for the raw value
    // ("25"), which is what the caret and backspace operate on.
    await expect(field).toHaveValue("25");

    // Clear by backspace rather than select-all: the field moves the caret to
    // the end on focus inside a requestAnimationFrame, which lands after a
    // select-all and clobbers it, leaving typing to append ("25" + "1" -> 251).
    for (let i = 0; i < 6; i++) await field.press("Backspace");
    await expect(field).toHaveValue("");

    await field.pressSequentially("120:00", { delay: 20 });
    await expect(field).toHaveValue("120:00");

    await field.blur();
    await expect(field).toHaveValue("120:00");
  });
});

test.describe("Long duration field layout", () => {
  const VIEWPORTS = [
    { name: "desktop", width: 1280, height: 720 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const vp of VIEWPORTS) {
    test(`fits the longest duration inside the timer ring on ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/#/");
      const field = page.getByRole("textbox", { name: "Set timer duration" });
      await field.waitFor({ timeout: 15_000 });
      const backdrop = page.locator("[data-achievement-backdrop]");
      if (await backdrop.count()) {
        await page.keyboard.press("Escape");
        await backdrop.waitFor({ state: "detached" });
      }

      await field.click();
      for (let i = 0; i < 6; i++) await field.press("Backspace");
      await field.pressSequentially("180:00", { delay: 20 });
      await expect(field).toHaveValue("180:00");
      await field.blur();

      const measured = await field.evaluate((el) => {
        // Both a desktop and a mobile ring are always in the DOM, one hidden by
        // a breakpoint class, so pick whichever one is actually laid out.
        const rings = [
          ...(el.closest("[data-timer-display]")?.querySelectorAll("svg") ??
            []),
        ]
          .map((s) => s.getBoundingClientRect())
          .filter((r) => r.width > 0);
        return {
          fieldWidth: el.getBoundingClientRect().width,
          ringWidth: rings[0]?.width ?? 0,
          // Truncation shows up as content wider than the visible box.
          clipped: el.scrollWidth > el.clientWidth + 1,
        };
      });

      // The whole point of the fix: wide enough to read, narrow enough to fit.
      expect(measured.clipped).toBe(false);
      expect(measured.fieldWidth).toBeLessThanOrEqual(measured.ringWidth);
    });
  }
});
