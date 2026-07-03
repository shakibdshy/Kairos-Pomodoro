import { test, expect } from "./helpers";

test.describe("Time-blocking", () => {
  test("Add Time button opens the block form", async ({ page }) => {
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(page).toHaveURL(/\/#\/calendar/);
    await expect(page.getByText("Your Weekly Timeline")).toBeVisible();

    await page.getByRole("button", { name: "Add Time" }).click();

    // Form modal opens with create copy
    await expect(page.getByText("New Time Block")).toBeVisible();
    await expect(page.getByPlaceholder(/Deep work on report/)).toBeVisible();
    // Two datetime-local inputs (start + end)
    await expect(page.locator('input[type="datetime-local"]')).toHaveCount(2);
  });

  test("creates a time block and persists it", async ({ page }) => {
    await page.getByRole("button", { name: "Calendar" }).click();

    await page.getByRole("button", { name: "Add Time" }).click();
    await page
      .getByPlaceholder(/Deep work on report/)
      .fill("Strategy session");

    await page.getByRole("button", { name: "Create Block" }).click();

    // Block is created and rendered into the calendar DOM (it renders in both
    // the mobile and desktop day columns; one may be visually hidden depending
    // on viewport, so we assert attached rather than visible).
    await expect(
      page.locator("p").filter({ hasText: "Strategy session" }).first(),
    ).toHaveCount(1);

    // Navigating away and back keeps the block (persistence).
    await page.getByRole("button", { name: "Timer" }).click();
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(
      page.locator("p").filter({ hasText: "Strategy session" }),
    ).toHaveCount(2); // one per view (mobile + desktop)
  });
});
