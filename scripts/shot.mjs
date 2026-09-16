// Dev-friendly screenshot helper: tolerates Vite's persistent HMR socket.
// usage: node scripts/shot.mjs <url> <out.png> [full|scrollY] [width] [height]
import { chromium } from "playwright";

const url = process.argv[2] || "http://127.0.0.1:5199/";
const out = process.argv[3] || "shot.png";
const mode = process.argv[4] || "";
const width = Number(process.argv[5] || 1440);
const height = Number(process.argv[6] || 960);

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
});
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
page.on("console", (m) => {
  if (m.type() === "error") console.log("[error]", m.text().slice(0, 300));
});
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 400)));
try {
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
} catch (e) {
  console.log("[goto]", String(e).slice(0, 200));
}
await page.waitForTimeout(4500);
if (mode === "full") {
  await page.screenshot({ path: out, fullPage: true });
} else {
  const y = Number(mode || 0);
  if (y) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(700);
  }
  await page.screenshot({ path: out });
}
const info = await page.evaluate(() => ({
  root: (document.getElementById("root") || {}).innerHTML?.length || 0,
  h: document.body.scrollHeight
}));
console.log(JSON.stringify(info), "->", out);
await browser.close();
