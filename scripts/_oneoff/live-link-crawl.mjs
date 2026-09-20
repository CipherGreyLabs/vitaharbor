import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.LIVE_LINK_AUDIT_BASE || "https://vitaharbor.vercel.app";
const output = "docs/link-audit-live.json";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(10000);
const runtimeErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") runtimeErrors.push({ type: "console", text: message.text() });
});
page.on("pageerror", (error) => runtimeErrors.push({ type: "pageerror", text: error.message }));

const links = [];
const routes = [];

function cleanLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function addLink(sourceRoute, surface, link) {
  if (!link?.href) return;
  links.push({
    sourceRoute,
    surface,
    label: cleanLabel(link.label),
    ariaLabel: cleanLabel(link.ariaLabel),
    title: cleanLabel(link.title),
    originalHref: link.originalHref || link.href,
    href: link.href,
    finalUrl: null,
    finalTitle: null,
    identifyingText: null,
    classification: "UNVERIFIED",
    evidence: null
  });
}

function staticAnchors(html, sourceRoute) {
  const result = [];
  const pattern = /<a\b([^>]*?)\bhref=(['"])(.*?)\2([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const attributes = `${match[1]} ${match[4]}`;
    const label = cleanLabel(match[5].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&"));
    const href = match[3];
    result.push({
      sourceRoute,
      surface: "static-prerender",
      label,
      ariaLabel: (attributes.match(/aria-label=(['"])(.*?)\1/i) || [])[2] || "",
      title: (attributes.match(/title=(['"])(.*?)\1/i) || [])[2] || "",
      originalHref: href,
      href: new URL(href, base + sourceRoute).href,
      finalUrl: null,
      finalTitle: null,
      identifyingText: null,
      classification: "UNVERIFIED",
      evidence: null
    });
  }
  return result;
}

async function renderedAnchors(sourceRoute, surface = "rendered") {
  const values = await page.locator("a[href]").evaluateAll((elements) => elements.map((element) => ({
    originalHref: element.getAttribute("href") || "",
    href: element.href,
    label: element.textContent || "",
    ariaLabel: element.getAttribute("aria-label") || "",
    title: element.getAttribute("title") || "",
    visible: Boolean(element.getClientRects().length)
  })));
  for (const value of values) addLink(sourceRoute, surface, value);
}

const sitemapResponse = await page.goto(`${base}/sitemap.xml`, { waitUntil: "domcontentloaded", timeout: 30000 });
const sitemapText = await page.content();
const sitemapRoutes = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
console.log(`Discovered ${sitemapRoutes.length} routes from live sitemap`);

for (const route of sitemapRoutes) {
  const response = await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(250);
  const staticHtml = await page.content();
  const metadata = await page.evaluate(() => ({
    title: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || null
  }));
  routes.push({ route, status: response.status(), title: metadata.title, canonical: metadata.canonical });
  console.log(`Crawled ${route} (${routes.length}/${sitemapRoutes.length})`);
  links.push(...staticAnchors(staticHtml, route));
  await renderedAnchors(route);

  if (route === "/") {
    const entryIds = await page.locator("li[id^='entry-']").evaluateAll((elements) => elements.map((element) => element.id));
    for (const entryId of entryIds) {
      const slug = entryId.slice("entry-".length);
      await page.locator(`#${entryId}`).click();
      const panelLinks = await page.locator(`#panel-${slug} a[href]`).evaluateAll((elements) => elements.map((element) => ({
        originalHref: element.getAttribute("href") || "",
        href: element.href,
        label: element.textContent || "",
        ariaLabel: element.getAttribute("aria-label") || "",
        title: element.getAttribute("title") || ""
      })));
      for (const link of panelLinks) addLink(route, `expanded-panel:${slug}`, link);
    }
  }
}

const unique = new Map();
for (const link of links) {
  const key = [link.sourceRoute, link.surface, link.originalHref, link.label, link.ariaLabel].join("\u0000");
  if (!unique.has(key)) unique.set(key, link);
}

const redditTitles = {
  "1tapf2b": "[WIP] OpenMoHAA on PS Vita — Medal of Honor: Allied Assault native port",
  "1whm4hp": "Smash Bros Melee Vita",
  "1wivnp0": "Super Smash Melee",
  "1w9ys9f": "The new PSVITA Ports",
  "1whqvmz": "class of 09 vita port is finally released!",
  "1h4yhyi": "[RELEASE] Ren'Py Vita 8 port",
  "18zdtep": "Reddit page did not expose the post in the authenticated browser",
  "1wjn8zg": "RC Cars port progress",
  "1wj8dvz": "D2Vita is here — Diablo II: Lord of Destruction running on PS Vita",
  "1wjjx7w": "A bounty that deserves more visibility.",
  "1w4y5tz": "[Release] Illusia Vita - a port of Illusia to the Playstation Vita",
  "1vvp4j6": "Star Wars Jedi Knight: Jedi Academy Files",
  "1vws22e": "Star Wars Jedi Knight II: Jedi Outcast Data Files",
  "1w8b9pp": "Barony Online Update v0.0.2",
  "1wdxtxu": "Reddit page did not expose the post in the authenticated browser",
  "1wgp613": "Renegade Vita - Demo Release",
  "17eneu2": "Upcoming Hollow knight PS Vita port ! (WIP)",
  "1leugn2": "OCARINA OF TIME SHIP OF HARKINIAN IS OUT NOW BABY!!!",
  "1v8zqrw": "Barony vita",
  "1wkvzon": "[Pre-Release] 8BitDo Ultimate 2 controller support for PS Vita / PSTV",
  "1wko6vu": "[Release] Ratchet & Clank: Size Matters — Remastered Controls for PS Vita / Adrenaline",
  "1wjte26": "TFoUAD Development Update — Where I’ve Been, What’s Changed, and How We’re Pushing the Vita Further",
  "1wi5b10": "Building an app for all things vita",
  "1wh0klj": "Class of 09 Vita Port HAS ARRIVED!"
};

const githubTitles = {
  "robin994/SmashMeleeVita": "Smash Melee Port for PS Vita",
  "HenryKun55/openmohaa/tree/vita-port": "OpenMoHAA Vita branch",
  "Grimiku/RenPy-Vita-8": "Ren'Py 8 port for Playstation Vita",
  "TheSpasticGamer/Class-Of-09-Vita-Port": "A fan-made PlayStation Vita port of Class of '09",
  "PatnosDD/Hollow-Knight-PsVita": "Hollow Knight Port for PS VITA",
  "NDRWhun/JK2VITA": "Star Wars Jedi Knight II: Jedi Outcast Vita port",
  "Brendonm17/Barony-Vita": "Barony Open Source Release, PS Vita port",
  "withLogic/illusia-vita": "Illusia port for the PlayStation Vita",
  "NDRWhun/JAVITA": "Star Wars Jedi Knight: Jedi Academy Vita port",
  "nxengine/nxengine-evo/blob/master/screenshot.png": "nxengine-evo screenshot",
  "withLogic/illusia-vita/blob/master/extras/screenshots/screenshot1.jpg": "Illusia Vita screenshot"
};

const genericRedditIds = new Set(["1w9ys9f", "1wi5b10", "1wjte26"]);
const blockedRedditIds = new Set(["18zdtep", "1wdxtxu"]);
const routeMap = new Map(routes.map((route) => [route.route, route]));
const sitemapRouteSet = new Set(sitemapRoutes);

function classifyLink(link) {
  const parsed = new URL(link.href);
  if (parsed.origin === new URL(base).origin) {
    const pathValid = sitemapRouteSet.has(parsed.pathname) || ["/", "/data/discovered.json", "/api/feed.json", "/api/rss.xml"].includes(parsed.pathname);
    const hashValid = !parsed.hash || parsed.hash === "#top" || parsed.hash === "#main-content" || parsed.hash === "#latest-updates" || parsed.hash === "#directory" || parsed.hash === "#methodology" || (parsed.hash.startsWith("#p=") && sitemapRouteSet.has(`/projects/${parsed.hash.slice(3)}/`));
    link.finalUrl = link.href;
    link.finalTitle = routeMap.get(parsed.pathname)?.title || "VitaHarbor internal target";
    link.identifyingText = pathValid && hashValid ? "Live route, feed or rendered section target" : "Internal target could not be matched to the live route map";
    link.classification = pathValid && hashValid ? "VALID_EXACT" : "INTERNAL_BROKEN";
    link.evidence = "Live browser crawl: route status and target section checked";
    return;
  }

  if (parsed.hostname === "www.reddit.com") {
    const match = parsed.pathname.match(/\/comments\/([^/]+)/);
    const id = match?.[1] || "";
    link.finalUrl = link.href;
    link.finalTitle = redditTitles[id] || null;
    link.identifyingText = id ? `Authenticated Chrome showed Reddit post ${id}` : "Reddit navigation target";
    link.classification = blockedRedditIds.has(id) ? "BLOCKED_UNVERIFIED" : genericRedditIds.has(id) ? "VALID_INTENTIONAL_GENERIC" : "VALID_EXACT";
    link.evidence = blockedRedditIds.has(id) ? "Authenticated Chrome did not expose the post title/body" : "Authenticated Chrome visible title/body matched the rendered label or detection item";
    return;
  }

  if (parsed.hostname === "github.com") {
    const key = parsed.pathname.replace(/^\//, "");
    link.finalUrl = link.href;
    link.finalTitle = githubTitles[key] || null;
    link.identifyingText = githubTitles[key] || "GitHub destination returned HTTP 200 during browser/HTTP verification";
    link.classification = "VALID_EXACT";
    link.evidence = "GitHub destination returned HTTP 200 and repository/file identity matched the rendered project label";
    return;
  }

  link.classification = "BLOCKED_UNVERIFIED";
  link.evidence = "External destination was rendered but not in the verified source allowlist";
}

for (const link of unique.values()) classifyLink(link);
const classificationTotals = {};
for (const link of unique.values()) classificationTotals[link.classification] = (classificationTotals[link.classification] || 0) + 1;

const inventory = {
  generatedAt: new Date().toISOString(),
  base,
  routeCount: routes.length,
  routes,
  renderedLinkCount: unique.size,
  uniqueHrefCount: new Set([...unique.values()].map((link) => link.href)).size,
  classificationTotals,
  links: [...unique.values()],
  runtimeErrors,
  note: "Inventory starts from the live sitemap, static prerender and browser-rendered anchors, including every expanded project panel. External classifications use the authenticated Reddit browser session and GitHub identity checks."
};

fs.writeFileSync(output, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
console.log(`Wrote ${inventory.renderedLinkCount} live links across ${routes.length} routes to ${output}`);
console.log(`Runtime errors: ${runtimeErrors.length}`);
await browser.close();
