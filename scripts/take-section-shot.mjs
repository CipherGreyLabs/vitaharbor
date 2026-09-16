import { chromium } from "playwright";

const url = process.argv[2] || "http://127.0.0.1:8787";
const from = Number(process.argv[3] || 700);
const to = Number(process.argv[4] || 1700);

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
});
const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
await page.evaluate((y) => window.scrollTo(0, y), from);
await page.waitForTimeout(600);
await page.screenshot({ path: "shot_section.png" });
const height = await page.evaluate(() => document.body.scrollHeight);
console.log("doc height:", height, "captured from", from, "to", to);
await browser.close();

