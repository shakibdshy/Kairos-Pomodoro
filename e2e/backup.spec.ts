import { test, expect } from "./helpers";

// Note: the actual file dialog (save/open) and fs writes are exercised via the
// vitest unit tests + the non-Tauri guard, since the Tauri dialog/fs plugins
// are not mocked for the browser E2E environment. This spec covers the UI.

test.describe("Backup & Restore UI", () => {
  test("Backup & Restore tab is present and renders its controls", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "SETTINGS" }).click();
    await expect(page).toHaveURL(/\/#\/settings/);

    // Open the Backup & Restore tab
    await page.getByRole("button", { name: "Backup & Restore" }).click();

    // Section heading (h3) — distinct from the mobile nav tab button.
    await expect(page.getByRole("heading", { name: "Backup & Restore" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Export Backup" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Restore Backup" }),
    ).toBeVisible();
  });

  test("Restore requires confirmation", async ({ page }) => {
    await page.getByRole("button", { name: "SETTINGS" }).click();
    await page.getByRole("button", { name: "Backup & Restore" }).click();

    await page.getByRole("button", { name: "Restore Backup" }).click();

    // Confirmation prompt appears with destructive wording
    await expect(page.getByText(/replace all current data/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Restore", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Cancel" }),
    ).toBeVisible();

    // Cancel dismisses it
    await page.getByRole("button", { name: "Cancel" }).click();
  });
});
