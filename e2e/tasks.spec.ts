import { test, expect } from "./helpers";

test.describe("Tasks", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole("button", { name: "Tasks" }).click();
    await expect(page).toHaveURL(/\/#\/tasks/);
  });

  test("shows Tasks page with title and Add Task button", async ({ page }) => {
    await expect(page.getByText("Your Tasks")).toBeVisible();
    await expect(page.getByRole("button", { name: /Add Task/ })).toBeVisible();
  });

  test("opens add task modal and creates a task", async ({ page }) => {
    await page.getByRole("button", { name: /Add Task/ }).click();

    await expect(page.getByText("New Task")).toBeVisible();
    await expect(page.getByPlaceholder("What are you working on?")).toBeVisible();

    await page.getByPlaceholder("What are you working on?").fill("My first test task");
    await page.getByRole("button", { name: "CREATE TASK" }).click();

    await expect(page.getByText("My first test task")).toBeVisible();
  });

  test("validates empty task name — CREATE TASK is disabled", async ({ page }) => {
    await page.getByRole("button", { name: /Add Task/ }).click();
    await expect(page.getByRole("button", { name: "CREATE TASK" })).toBeDisabled();
  });

  test("cancel button closes modal without creating task", async ({ page }) => {
    await page.getByRole("button", { name: /Add Task/ }).click();
    await page.getByPlaceholder("What are you working on?").fill("Should not appear");

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("New Task")).not.toBeVisible();
    await expect(page.getByText("Should not appear")).not.toBeVisible();
  });

  test("search input filters tasks", async ({ page }) => {
    await page.getByRole("button", { name: /Add Task/ }).click();
    await page.getByPlaceholder("What are you working on?").fill("Design review");
    await page.getByRole("button", { name: "CREATE TASK" }).click();

    await page.getByRole("button", { name: /Add Task/ }).click();
    await page.getByPlaceholder("What are you working on?").fill("Code refactoring");
    await page.getByRole("button", { name: "CREATE TASK" }).click();

    await expect(page.getByText("Design review")).toBeVisible();
    await expect(page.getByText("Code refactoring")).toBeVisible();

    await page.getByPlaceholder("Search tasks...").fill("Design");
    await expect(page.getByText("Design review")).toBeVisible();
    await expect(page.getByText("Code refactoring")).not.toBeVisible();
  });

  test("clicking a task sets it as active", async ({ page }) => {
    await page.getByRole("button", { name: /Add Task/ }).click();
    await page.getByPlaceholder("What are you working on?").fill("Test active task");
    await page.getByRole("button", { name: "CREATE TASK" }).click();

    await page.getByText("Test active task").click();

    // The "Active" badge appears near the task — use exact text match within a badge element
    await expect(page.locator("div.rounded-full").filter({ hasText: /^Active$/ })).toBeVisible();
  });
});
