import { test, expect } from "./helpers";

test.describe("Theme presets", () => {
  test("color theme picker is visible and switches data-theme", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "SETTINGS" }).click();
    await expect(page).toHaveURL(/\/#\/settings/);

    // Color Theme section appears under General
    await expect(page.getByText("Color Theme")).toBeVisible();

    // Switch to Forest
    await page.getByRole("button", { name: "Forest" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "forest");

    // Switch to Ocean
    await page.getByRole("button", { name: "Ocean" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "ocean");

    // Switch back to Sahara (default)
    await page.getByRole("button", { name: "Sahara" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "sahara");
  });
});
