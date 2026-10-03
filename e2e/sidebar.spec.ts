import { test, expect } from "./helpers";
import type { Locator } from "@playwright/test";

type HandlePoints = {
  centre: boolean;
  outerEdge: boolean;
  box: { x: number; y: number; width: number; height: number };
};

/**
 * Hit-tests the handle at its centre and a sliver of its outermost edge.
 * Polls, because route changes settle layout asynchronously.
 */
async function pollHandlePoints(locator: Locator): Promise<HandlePoints> {
  const deadline = Date.now() + 10_000;
  let last: HandlePoints | undefined;

  do {
    last = await locator.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const owns = (node: Element | null) =>
        node === el || (node !== null && el.contains(node));
      return {
        centre: owns(
          document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2),
        ),
        outerEdge: owns(
          document.elementFromPoint(r.right - 1, r.top + r.height / 2),
        ),
        box: { x: r.x, y: r.y, width: r.width, height: r.height },
      };
    });

    if (last.centre && last.outerEdge) return last;
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (Date.now() < deadline);

  throw new Error(
    `Handle was never fully hit-testable. Last observation: ${JSON.stringify(last)}`,
  );
}

test.describe("Sidebar collapse toggle", () => {
  test("collapses and expands the sidebar", async ({ page }) => {
    const sidebar = page.locator("aside").first();

    await expect(sidebar.getByText("Timer", { exact: true })).toBeVisible();
    await expect(sidebar.getByText("Kairos-Pomodoro")).toBeVisible();

    await page.getByRole("button", { name: "Collapse sidebar" }).click();

    // Collapsed: the wordmark is replaced by an avatar, nav labels are removed.
    await expect(sidebar.getByText("Timer", { exact: true })).toHaveCount(0);
    await expect(sidebar.getByText("Kairos-Pomodoro")).toHaveCount(0);
    await expect(sidebar.locator("nav").getByTitle("Timer")).toBeVisible();

    await page.getByRole("button", { name: "Expand sidebar" }).click();

    await expect(sidebar.getByText("Timer", { exact: true })).toBeVisible();
    await expect(sidebar.getByText("Kairos-Pomodoro")).toBeVisible();
  });

  test("handle renders whole in both collapsed and expanded states", async ({
    page,
  }) => {
    const expanded = await pollHandlePoints(
      page.getByRole("button", { name: "Collapse sidebar" }),
    );
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    const collapsed = await pollHandlePoints(
      page.getByRole("button", { name: "Expand sidebar" }),
    );

    for (const state of [expanded, collapsed]) {
      expect(state.box.width).toBeCloseTo(28, 0);
      expect(state.box.height).toBeCloseTo(28, 0);
    }
  });

  test("outer half of the handle is clickable", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "Collapse sidebar" });
    const { box } = await pollHandlePoints(toggle);

    // The outer sliver used to be clipped away and therefore not hit-testable.
    await page.mouse.click(box.x + box.width - 3, box.y + box.height / 2);

    await expect(
      page.locator("aside").first().getByText("Kairos-Pomodoro"),
    ).toHaveCount(0);
  });

  test("handle sits above adjacent page content", async ({ page }) => {
    await page.getByRole("button", { name: "Tasks" }).click();
    await expect(page).toHaveURL(/\/#\/tasks/);
    await expect(page.getByText("Your Tasks")).toBeVisible();

    await pollHandlePoints(
      page.getByRole("button", { name: "Collapse sidebar" }),
    );
  });

  test("handle is reachable and operable by keyboard", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "Collapse sidebar" });
    await toggle.focus();
    await expect(toggle).toBeFocused();

    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("button", { name: "Expand sidebar" }),
    ).toBeFocused();
    await expect(
      page.locator("aside").first().getByText("Kairos-Pomodoro"),
    ).toHaveCount(0);
  });
});
