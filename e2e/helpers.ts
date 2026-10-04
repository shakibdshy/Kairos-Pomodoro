import { test as base, expect as pwExpect, type Page } from "@playwright/test";

export async function waitForApp(page: Page) {
  await page.waitForURL(/#\/$/);
  await page.waitForSelector("text=START SESSION", { timeout: 15_000 });
  await dismissAchievementDialog(page);
}

/**
 * An achievement announcement mounts a modal backdrop that swallows pointer
 * events until it is dismissed, which blocks every click in the suite. It
 * arrives asynchronously, so wait briefly for it before giving up.
 *
 * Only the *optional* wait is swallowed. If a backdrop does attach and Escape
 * fails to remove it, that must fail setup loudly — proceeding would hand every
 * test a page whose clicks silently go nowhere.
 */
async function dismissAchievementDialog(page: Page) {
  const backdrop = page.locator("[data-achievement-backdrop]");
  const attached = await backdrop
    .waitFor({ state: "attached", timeout: 3_000 })
    .then(() => true)
    .catch(() => false);

  if (!attached) return;

  await page.keyboard.press("Escape");
  await backdrop.waitFor({ state: "detached", timeout: 3_000 });
}

export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    await page.goto("/#/");
    await waitForApp(page);
    await use(page);
  },
});

export const expect = pwExpect;
