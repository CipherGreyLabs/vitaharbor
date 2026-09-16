import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:8787";
const path = process.argv[3] || "/";
const out = process.argv[4] || "shot_page.png";
const scrollTo = Number(process.argv[5] || 0);

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
});
const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") console.log("[" + m.type() + "]", m.text().slice(0, 400));
});
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 600)));
const resp = await page.goto(base + path, { waitUntil: "networkidle" });
console.log("status:", resp && resp.status());
await page.waitForTimeout(3000);
const rootHtml = await page.evaluate(() => (document.getElementById("root") || {}).innerHTML || "");
console.log("root length:", rootHtml.length);
if (scrollTo) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
  await page.waitForTimeout(500);
}
await page.screenshot({ path: out });
const h = await page.evaluate(() => document.body.scrollHeight);
console.log("path:", path, "height:", h, "->", out);
await browser.close();

