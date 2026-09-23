import { test, expect } from "playwright/test";
import { FALLBACK_PROJECTS } from "../../src/shared/constants/fallbackData";

test.describe("archive", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("lists entries with only the source links that are actually verified", async ({ page }) => {
    const rows = page.locator("li[id^='entry-']");
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThan(10);

    const sourceCounts = await rows.evaluateAll((elements) =>
      elements.map((element) => element.querySelectorAll("a[href*='reddit.com']").length)
    );
    expect(sourceCounts.every((sourceCount) => sourceCount <= 1)).toBe(true);
    expect(sourceCounts.some((sourceCount) => sourceCount === 0)).toBe(true);
    expect(sourceCounts.filter((sourceCount) => sourceCount > 0).length).toBeGreaterThan(10);
  });

  test("rendered outbound anchors contain no dead targets or placeholders", async ({ page }) => {
    const hrefs = await page.locator("a[href]").evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href") || "")
    );
    const external = hrefs.filter((href) => /^https?:\/\//i.test(href) && !href.startsWith("https://vitaharbor.vercel.app/"));
    const forbidden = [
      "126a9bf", "16l8h0m", "q1910a", "1ij1vzf", "1iuoe4u", "1inclw4", "192k7s9", "18zdtep", "1wdxtxu",
      "openmohaa/openmohaa", "doldecomp/melee", "patnosDD/Hollow-Knight-Vita", "SonicMastr/renpy-vita",
      "HarbourMasters/Shipwright", "alexbatalov/fallout2-ce"
    ];

    expect(external.some((href) => !href || /^javascript:/i.test(href))).toBe(false);
    expect(external.some((href) => forbidden.some((value) => href === value || href.includes(value)))).toBe(false);
    expect(external).not.toContain("https://github.com/nxengine/nxengine-evo");
    expect(await page.locator("[role='region'][aria-label='Latest community signals'] a[href='#directory']").count()).toBe(0);
  });

  test("a deep link opens and expands that entry", async ({ page }) => {
    await page.goto("/#p=hollow-knight-vita", { waitUntil: "domcontentloaded" });
    const panel = page.locator("div#panel-hollow-knight-vita");
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Milestones");
  });

  test("expanded project details show an absolute project-activity date, not a relative age", async ({ page }) => {
    await page.goto("/#p=test-drive-1987-vita", { waitUntil: "domcontentloaded" });
    const panel = page.locator("#panel-test-drive-1987-vita");
    await expect(panel).toBeVisible();
    await expect(panel.getByText("Latest project activity", { exact: true })).toBeVisible();
    const activityField = panel.locator("dl > div").filter({ hasText: "Latest project activity" });
    await expect(activityField.locator("dd")).toHaveText(/^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$/);
    await expect(panel).not.toContainText(/\b\d+\s*d ago\b|\b\d+\s+days? ago\b/i);
  });

  test("search narrows the list and escape clears it", async ({ page }) => {
    const rows = page.locator("li[id^='entry-']");
    await expect(rows.first()).toBeVisible();
    const before = await rows.count();

    await page.keyboard.press("/");
    const search = page.getByLabel("Filter the directory");
    await expect(search).toBeFocused();

    await search.fill("zelda");
    await expect(rows.first()).toBeVisible();
    await expect.poll(async () => rows.count()).toBeLessThan(before);

    await page.keyboard.press("Escape");
    await expect.poll(async () => rows.count()).toBe(before);
  });

  test("directory filters survive as a shareable URL", async ({ page }) => {
    await page.goto("/?q=zelda&stage=wip&type=decomp&sort=name", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel("Filter the directory")).toHaveValue("zelda");
    await expect(page.locator("select")).toHaveValue("name");
    await expect(page.getByText("Decompilation", { exact: false }).first()).toBeVisible();

    await page.getByRole("button", { name: /clear all/i }).click();
    await expect.poll(() => new URL(page.url()).search).toBe("");
  });

  test("released and recently updated filters can be selected", async ({ page }) => {
    const released = page.getByRole("button", { name: /Released \(/ });
    await released.click();
    await expect(released).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("li[id^='entry-']").first()).toBeVisible();

    const recent = page.getByRole("button", { name: /Recently updated \(/ });
    await recent.click();
    await expect(recent).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("li[id^='entry-']").first()).toBeVisible();
  });

  test("community posts show their unverified status without scanner diagnostics", async ({ page }) => {
    const healthResponse = await page.request.get("/data/scanner-health.json");
    expect(healthResponse.headers()["content-type"]).toContain("text/html");
    expect(await healthResponse.text()).not.toMatch(/"attempted_at"\s*:/i);
    const queueResponse = await page.request.get("/data/discovered.json");
    expect(queueResponse.ok()).toBe(true);
    const queue = await queueResponse.json();
    expect(Object.keys(queue).sort()).toEqual(["items", "schema_version"]);
    expect(queue.schema_version).toBe(1);
    expect(queue.items.length).toBeGreaterThan(0);
    for (const item of queue.items) {
      expect(Object.keys(item).sort()).toEqual(["published_at", "subreddit", "title", "url", "verification"]);
      expect(item.verification).toBe("unverified");
    }

    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.route("https://raw.githubusercontent.com/CipherGreyLabs/vitaharbor/main/public/data/discovered.json*", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(queue) }));
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Community posts to explore" })).toBeVisible();
    await expect(page.getByText("Unverified lead", { exact: true }).first()).toBeVisible();
    const homeText = await page.locator("body").innerText();
    expect(homeText).not.toMatch(/scanner|run id|rate.?limit|last attempt|3× daily|github action|review queue|quarantined|pending review/i);

    await page.goto("/discovery/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Community posts" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Unverified community posts" }).getByText("Unverified lead").first()).toBeVisible();
    const discoveryText = await page.locator("body").innerText();
    expect(discoveryText).not.toMatch(/scanner|run id|rate.?limit|last attempt|3× daily|github action|review queue|quarantined|pending review/i);
    expect(requests.some((url) => url.includes("scanner-health.json"))).toBe(false);
  });

  test("community posts remain readable on mobile and static pages omit scanner diagnostics", async ({ page, browser, request }) => {
    const homeResponse = await request.get("/");
    expect(homeResponse.ok()).toBe(true);
    const staticHtml = await homeResponse.text();
    expect(staticHtml).not.toMatch(/scanner-health|run_id|rate_limited|consecutive_failures|github_action|3× daily|review queue|quarantined/i);

    const discoveryResponse = await request.get("/discovery/");
    expect(discoveryResponse.ok()).toBe(true);
    const discoveryHtml = await discoveryResponse.text();
    expect(discoveryHtml).toContain("<title>Community posts - VitaHarbor</title>");
    expect(discoveryHtml).toContain('content="Recent Reddit posts about possible Vita ports and updates. Posts are unverified leads, not confirmed project records."');
    expect(discoveryHtml).not.toMatch(/scanner|discovery queue|detection log|awaiting source review|review queue|quarantined/i);

    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const noJsPage = await context.newPage();
    await noJsPage.goto("/", { waitUntil: "domcontentloaded" });
    const noJsText = await noJsPage.locator("body").innerText();
    expect(noJsText).toContain("Directory");
    expect(noJsText).toContain("Unverified community posts are shown separately from the project directory.");
    expect(noJsText).toContain("A community post alone does not confirm a project's status or performance.");
    expect(noJsText).not.toMatch(/scanner|run id|rate.?limit|last attempt|3× daily|github action|detection log|detected threads|discovery queue|source review|review queue|quarantined|pending review/i);
    await context.close();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/discovery/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Community posts" })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });

  test("a project can be saved and removed from the browser watchlist", async ({ page }) => {
    const project = FALLBACK_PROJECTS[0];
    await page.goto(`/projects/${project.slug}/`, { waitUntil: "domcontentloaded" });
    const watchButton = page.getByRole("button", { name: "WATCH", exact: true });
    await expect(watchButton).toBeVisible();
    await watchButton.click();
    await expect(page.getByRole("button", { name: "WATCHING", exact: true })).toHaveAttribute("aria-pressed", "true");

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const watchlist = page.getByRole("region", { name: "Your watchlist" });
    await expect(page.getByRole("heading", { name: "Your watchlist" })).toBeVisible();
    await expect(watchlist.getByRole("link", { name: project.display_name || project.game_title })).toBeVisible();
    await watchlist.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByRole("heading", { name: "Your watchlist" })).toHaveCount(0);
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

  test("a source-backed screenshot appears on the console when its row is selected", async ({ page }) => {
    await page.locator("#entry-illusia-vita").click();
    await expect(page.getByText("Source screenshot on display", { exact: true })).toBeVisible();
    await expect(page.getByAltText("Illusia title screen running on the Vita port")).toBeVisible();
  });

  test("new source-backed Vita screenshots load from their matching projects", async ({ page }) => {
    const screenshots = [
      ["rc-cars-vita", "RC Cars gameplay photographed on two PS Vita consoles"],
      ["d2vita", "Diablo II: Lord of Destruction title screen from the D2Vita Vita port"],
      ["jedi-academy-vita", "Jedi Academy Vita title screen photographed on a PS Vita"],
      ["call-of-duty-4-vita", "Call of Duty 4 gameplay photographed on a PS Vita"]
    ] as const;

    for (const [slug, alt] of screenshots) {
      await page.locator(`#entry-${slug}`).click();
      await expect(page.getByAltText(alt)).toBeVisible();
    }
  });

  test("the console selector exposes every ledger project", async ({ page }) => {
    const selector = page.locator("[aria-label='Choose a project to preview']");
    await expect(selector).toBeVisible();
    await expect(selector.locator("button")).toHaveCount(FALLBACK_PROJECTS.length);
  });

  test("desktop WebGL renders the 3D Vita by default", async ({ page }) => {
    const stage = page.locator("[data-testid='console-stage']");
    await expect(stage).toHaveAttribute("data-vita-mode", "3d");
    await stage.scrollIntoViewIfNeeded();
    await expect(page.getByTestId("vita-3d-canvas")).toBeVisible();
    await expect(stage).toHaveAttribute("data-vita-scene-state", "ready");
    await expect(page.getByTestId("static-vita-screen")).not.toBeVisible();
  });

  test("reduced motion keeps the 3D Vita but disables scene motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "domcontentloaded" });
    const stage = page.locator("[data-testid='console-stage']");
    await expect(stage).toHaveAttribute("data-vita-mode", "3d");
    await expect(stage).toHaveAttribute("data-reduced-motion", "true");
    await stage.scrollIntoViewIfNeeded();
    await expect(page.getByTestId("vita-3d-canvas")).toBeVisible();
    await expect(page.locator("[data-vita-scene='3d'] [data-vita-motion='reduced']")).toBeVisible();
    await expect(page.getByTestId("static-vita-screen")).not.toBeVisible();
  });

  test("Show on Vita updates the reduced-motion 3D preview", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#entry-illusia-vita").click();
    await expect(page.getByRole("button", { name: "Show on Vita" })).toBeVisible();

    await page.getByRole("button", { name: "Medal of Honor: Allied Assault", exact: true }).click();
    await page.getByRole("button", { name: "Show on Vita" }).click();

    await expect(page.getByText("Source screenshot on display", { exact: true })).toBeVisible();
    await expect(page.getByTestId("vita-3d-canvas")).toBeVisible();
  });

  test("save-data starts static, persists the 3D override, and switches back", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", {
        configurable: true,
        value: { saveData: true }
      });
    });
    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-testid='console-stage']")).toHaveAttribute("data-vita-mode", "static");
    await expect(page.getByRole("button", { name: "Load 3D Vita" })).toBeVisible();
    await page.getByRole("button", { name: "Load 3D Vita" }).click();
    await expect(page.locator("[data-testid='console-stage']")).toHaveAttribute("data-vita-mode", "3d");
    await expect(page.getByTestId("vita-3d-canvas")).toBeVisible();
    await expect(page.getByRole("button", { name: "Use static preview" })).toBeVisible();
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), "vitaharbor.console-3d-preference")).toBe("3d");

    await page.getByRole("button", { name: "Use static preview" }).click();
    await expect(page.locator("[data-testid='console-stage']")).toHaveAttribute("data-vita-mode", "static");
    await expect(page.getByTestId("static-vita-screen")).toBeVisible();
  });

  test("WebGL failure keeps a static preview with an honest retry state", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      (HTMLCanvasElement.prototype as any).getContext = function (type: string, ...args: any[]) {
        if (type === "webgl" || type === "experimental-webgl") return null;
        return original.call(this, type, ...args);
      };
    });
    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-testid='console-stage']")).toHaveAttribute("data-vita-mode", "static");
    await expect(page.locator("[data-testid='console-stage']")).toHaveAttribute("data-vita-fallback-reason", "webgl-unavailable");
    await expect(page.getByTestId("static-vita-screen")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry 3D Vita" })).toBeVisible();
  });

  test("directory uses a compact grid and provides a back-to-top control", async ({ page }) => {
    const grid = page.locator("#directory ul");
    await expect(grid).toBeVisible();
    const columns = await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length);
    expect(columns).toBe(4);

    await page.evaluate(() => window.scrollTo(0, 700));
    const backToTop = page.getByRole("button", { name: "Scroll to top" });
    await expect(backToTop).toBeVisible();
    await backToTop.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(20);
  });
});
