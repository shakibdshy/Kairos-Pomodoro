import { test, expect } from "./helpers";

test.describe("Timer", () => {
  test("shows default 25:00 timer with START FOCUS button", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: "Set timer duration" })).toHaveValue("25:00");
    await expect(page.getByRole("button", { name: "START FOCUS" })).toBeVisible();
  });

  test("switches to Break phase", async ({ page }) => {
    await page.getByRole("button", { name: "Break" }).click();
    await expect(page.getByRole("textbox", { name: "Set timer duration" })).toHaveValue("05:00");
  });

  test("switches back to Focus phase from Break", async ({ page }) => {
    await page.getByRole("button", { name: "Break" }).click();
    await expect(page.getByRole("textbox", { name: "Set timer duration" })).toHaveValue("05:00");

    await page.getByRole("button", { name: "Focus", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Set timer duration" })).toHaveValue("25:00");
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
    await expect(page.getByRole("button", { name: "START FOCUS" })).toBeVisible();
  });

  test("phase selector buttons are disabled while running", async ({ page }) => {
    await page.getByRole("button", { name: "START FOCUS" }).click();

    await expect(page.getByRole("button", { name: "Focus" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Break" })).toBeDisabled();
  });

  test("reset button returns timer to idle", async ({ page }) => {
    await page.getByRole("button", { name: "Break" }).click();
    await page.getByRole("button", { name: "START FOCUS" }).click();
    await expect(page.getByRole("button", { name: "PAUSE" })).toBeVisible();

    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(page.getByRole("button", { name: "START FOCUS" })).toBeVisible();
  });
});
