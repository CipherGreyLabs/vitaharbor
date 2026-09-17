import { test, expect } from "playwright/test";

test.describe("archive", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("lists every entry with a source link", async ({ page }) => {
    const rows = page.locator("li[id^='entry-']");
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThan(10);

    // every listed entry must link back to a public thread
    const sources = page.locator("li[id^='entry-'] a[href*='reddit.com']");
    expect(await sources.count()).toBe(count);
  });

  test("a deep link opens and expands that entry", async ({ page }) => {
    await page.goto("/#p=hollow-knight-vita", { waitUntil: "domcontentloaded" });
    const panel = page.locator("div#panel-hollow-knight-vita");
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Milestones");
  });

  test("search narrows the list and escape clears it", async ({ page }) => {
    const rows = page.locator("li[id^='entry-']");
    await expect(rows.first()).toBeVisible();
    const before = await rows.count();

    await page.locator("main").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("/");
    const search = page.getByLabel("Filter the directory");
    await expect(search).toBeFocused();

    await search.fill("zelda");
    await expect(rows.first()).toBeVisible();
    await expect.poll(async () => rows.count()).toBeLessThan(before);

    await page.keyboard.press("Escape");
    await expect.poll(async () => rows.count()).toBe(before);
  });

  test("the moving ticker can be paused", async ({ page }) => {
    // Scoped to the ticker region: the button's label changes with its state.
    const toggle = page.locator("[role='region'][aria-label='Latest community signals'] button");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });
});
