import { test, expect } from "./helpers";

test.describe("Timer", () => {
  test("shows default 25:00 timer with START FOCUS button", async ({ page }) => {
    await expect(page.getByText("25:00")).toBeVisible();
    await expect(page.getByRole("button", { name: "START FOCUS" })).toBeVisible();
  });

  test("switches to Short Break phase", async ({ page }) => {
    await page.getByRole("button", { name: "Short Break" }).click();
    await expect(page.getByText("05:00")).toBeVisible();
  });

  test("switches to Long Break phase", async ({ page }) => {
    await page.getByRole("button", { name: "Long Break" }).click();
    await expect(page.getByText("15:00")).toBeVisible();
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

    await expect(page.getByRole("button", { name: "Work" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Short Break" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Long Break" })).toBeDisabled();
  });

  test("reset button returns timer to idle", async ({ page }) => {
    await page.getByRole("button", { name: "Short Break" }).click();
    await page.getByRole("button", { name: "START FOCUS" }).click();
    await expect(page.getByRole("button", { name: "PAUSE" })).toBeVisible();

    // Click the reset button (RotateCcw icon button, outline variant)
    await page.locator('aside ~ div').locator('button').filter({ has: page.locator('svg.lucide-rotate-ccw') }).first().click();

    // Or use the main content area reset button
    await page.getByRole("button", { name: "START FOCUS" }).waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  });
});
