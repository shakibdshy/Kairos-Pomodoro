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

    await expect(page.getByRole("button", { name: "Focus" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Break" })).toBeDisabled();
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
    await field.fill("120:00");
    await field.blur();

    await expect(field).toHaveValue("120:00");
  });
});
