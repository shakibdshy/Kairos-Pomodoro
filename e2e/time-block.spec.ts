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
    await page.getByPlaceholder(/Deep work on report/).fill("Strategy session");

    // Pin the range instead of relying on the form's default. The default is
    // 09:00-09:25, which is in the future when the suite runs before 09:25 and
    // is rejected by the form's own "end cannot be in the future" rule.
    const end = new Date(Date.now() - 60_000);
    const start = new Date(end.getTime() - 25 * 60_000);
    const toLocalInput = (d: Date) => {
      const p = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    };

    const inputs = page.locator('input[type="datetime-local"]');
    await inputs.nth(0).fill(toLocalInput(start));
    await inputs.nth(1).fill(toLocalInput(end));

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
