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
