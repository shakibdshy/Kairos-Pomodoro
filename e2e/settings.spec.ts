import { test, expect } from "./helpers";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole("button", { name: "SETTINGS" }).click();
    await expect(page).toHaveURL(/\/#\/settings/);
  });

  test("shows all settings tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: "General" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Focus Rhythm" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Notifications" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hotkeys" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Privacy & Data" })).toBeVisible();
  });

  test("General tab shows theme picker and toggles", async ({ page }) => {
    await page.getByRole("button", { name: "General" }).click();
    await expect(page.getByText("Appearance")).toBeVisible();
    await expect(page.getByRole("button", { name: "Light" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Dark" })).toBeVisible();
    await expect(page.getByRole("button", { name: "System" })).toBeVisible();
  });

  test("Focus Rhythm tab shows duration inputs", async ({ page }) => {
    await page.getByRole("button", { name: "Focus Rhythm" }).click();
    await expect(page.getByRole("heading", { name: "Focus Rhythm" })).toBeVisible();
    await expect(page.getByText("Focus Duration")).toBeVisible();
  });

  test("Hotkeys tab shows keyboard shortcuts", async ({ page }) => {
    await page.getByRole("button", { name: "Hotkeys" }).click();
    await expect(page.getByText("Keyboard Shortcuts")).toBeVisible();
    await expect(page.getByText("Start / Pause Timer")).toBeVisible();
    await expect(page.getByText("Reset Timer")).toBeVisible();
    await expect(page.getByText("Finish Session")).toBeVisible();
  });

  test("Privacy & Data tab shows clear data option", async ({ page }) => {
    await page.getByRole("button", { name: "Privacy & Data" }).click();
    await expect(page.getByRole("button", { name: "Clear All Data" })).toBeVisible();
  });

  test("Notifications tab shows notification controls", async ({ page }) => {
    await page.getByRole("button", { name: "Notifications" }).click();
    await expect(page.getByText("Notifications & Sounds")).toBeVisible();
  });
});
