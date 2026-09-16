import { chromium } from "playwright";

const url = process.argv[2] || "https://vitaharbor.vercel.app";

async function run() {
  const browser = await chromium.launch({
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(4500);
  await page.screenshot({ path: "shot_hero.png" });
  await page.screenshot({ path: "shot_full.png", fullPage: true });
  const title = await page.title();
  console.log("TITLE:", title);
  await browser.close();
  console.log("Screenshots written: shot_hero.png, shot_full.png");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

