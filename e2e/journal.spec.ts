import { test, expect } from "./helpers";

test.describe("Journal", () => {
  test("journal page renders and accepts a new entry", async ({ page }) => {
    await page.getByRole("button", { name: "Journal" }).click();
    await expect(page).toHaveURL(/\/#\/journal/);
    await expect(page.getByText("Journal").first()).toBeVisible();

    // Empty state initially
    await expect(page.getByText("Your journal is empty")).toBeVisible();

    // Open composer and write
    await page.getByRole("button", { name: "New Entry" }).click();
    await page
      .getByPlaceholder(/What's on your mind/)
      .fill("Shipped the time-blocking feature today.");
    await page.getByRole("button", { name: "Save" }).click();

    // Entry appears
    await expect(
      page.getByText("Shipped the time-blocking feature today."),
    ).toBeVisible();
  });

  test("journal entry can be edited", async ({ page }) => {
    await page.getByRole("button", { name: "Journal" }).click();

    await page.getByRole("button", { name: "New Entry" }).click();
    await page.getByPlaceholder(/What's on your mind/).fill("Original text");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Original text")).toBeVisible();

    // Edit
    await page.getByRole("button", { name: "Edit" }).click();
    await page
      .locator("textarea")
      .filter({ hasText: "Original text" })
      .fill("Edited text");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Edited text")).toBeVisible();
  });
});
