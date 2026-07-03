import { test, expect } from "./helpers";

test.describe("Time-blocking", () => {
  test("Add Time button opens the focus-time form", async ({ page }) => {
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(page).toHaveURL(/\/#\/calendar/);
    await expect(page.getByText("Your Weekly Timeline")).toBeVisible();

    await page.getByRole("button", { name: "Add Time" }).click();

    // Form modal opens with create copy
    await expect(
      page.getByRole("heading", { name: "Log Focus Time" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder(/Deep work on report/)).toBeVisible();
    // Two datetime-local inputs (start + end)
    await expect(page.locator('input[type="datetime-local"]')).toHaveCount(2);
  });

  test("logs focus time and closes the form on submit", async ({ page }) => {
    await page.getByRole("button", { name: "Calendar" }).click();

    await page.getByRole("button", { name: "Add Time" }).click();
    await page
      .getByPlaceholder(/Deep work on report/)
      .fill("Strategy session");

    await page.getByRole("button", { name: "Log Focus Time" }).click();

    // Modal closes after submit.
    await expect(
      page.getByRole("heading", { name: "Log Focus Time" }),
    ).not.toBeVisible();

    // Persistence: navigate away and back; the created block/session still
    // appears on the calendar (the db-mock now honors DATE(started_at) reads).
    await page.getByRole("button", { name: "Timer" }).click();
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(page.getByText("Strategy session").first()).toBeAttached();
  });
});
