import { test, expect } from "./helpers";

test.describe("Navigation", () => {
  test("starts on the Timer page", async ({ page }) => {
    await expect(page.locator("text=START FOCUS")).toBeVisible();
    await expect(page.locator("text=Kairos-Pomodoro")).toBeVisible();
  });

  test("navigates to Tasks page via sidebar", async ({ page }) => {
    await page.getByRole("button", { name: "Tasks" }).click();
    await expect(page).toHaveURL(/\/#\/tasks/);
    await expect(page.getByText("Your Tasks")).toBeVisible();
  });

  test("navigates to Calendar page via sidebar", async ({ page }) => {
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(page).toHaveURL(/\/#\/calendar/);
    await expect(page.getByText("Your Weekly Timeline")).toBeVisible();
  });

  test("navigates to Analytics page via sidebar", async ({ page }) => {
    await page.getByRole("button", { name: "Analytics" }).click();
    await expect(page).toHaveURL(/\/#\/analytics/);
    await expect(page.getByText("Your Focus Insights")).toBeVisible();
  });

  test("navigates to Settings page via sidebar", async ({ page }) => {
    await page.getByRole("button", { name: "SETTINGS" }).click();
    await expect(page).toHaveURL(/\/#\/settings/);
    await expect(page.getByText("App Settings")).toBeVisible();
  });

  test("navigates to Help/Onboarding page", async ({ page }) => {
    await page.getByRole("button", { name: "HELP" }).click();
    await expect(page).toHaveURL(/\/#\/onboarding/);
    await expect(page.getByText("Welcome to Deep Work").first()).toBeVisible();
  });

  test("navigates back to Timer via sidebar START SESSION button", async ({ page }) => {
    await page.getByRole("button", { name: "Tasks" }).click();
    await expect(page).toHaveURL(/\/#\/tasks/);

    await page.getByRole("button", { name: "START SESSION" }).click();
    await expect(page).toHaveURL(/\/#\/$/);
  });

  test("sidebar START SESSION button is disabled when session is running", async ({ page }) => {
    // Start a session via the main START FOCUS button
    await page.getByRole("button", { name: "START FOCUS" }).click();

    // Wait for the PAUSE button to appear (confirms session is running)
    await expect(page.getByRole("button", { name: "PAUSE" })).toBeVisible();

    // Now check the sidebar button — it should be disabled
    const sidebarBtn = page.locator("aside button").filter({ hasText: "SESSION" });
    await expect(sidebarBtn).toBeDisabled();
  });
});
