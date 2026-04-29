import { test as base, expect as pwExpect, type Page } from "@playwright/test";

export async function waitForApp(page: Page) {
  await page.waitForURL(/#\/$/);
  await page.waitForSelector("text=START SESSION", { timeout: 15_000 });
}

export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    await page.goto("/#/");
    await waitForApp(page);
    await use(page);
  },
});

export const expect = pwExpect;
