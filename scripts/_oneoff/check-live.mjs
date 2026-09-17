// One-off live smoke check: verifies each route renders real data and applies its
// own document title. usage: node scripts/_oneoff/check-live.mjs [origin]
import { chromium } from "playwright";

const origin = (process.argv[2] || "https://vitaharbor.vercel.app").replace(/\/$/, "");

const routes = [
  ["/", "PlayStation Vita Port", 600],
  ["/projects", "Port ledger", 600],
  ["/developers", "Reverse engineers", 600],
  ["/updates", "Signal stream", 600],
  ["/about", "About", 600],
  ["/projects/gta-san-andreas-vita", "Vita port", 600],
  ["/developers/theflow", "", 600],
  ["/definitely-not-a-route", "404", 100]
];

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
});
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

let failures = 0;

for (const [route, expectTitle, minText] of routes) {
  const errors = [];
  const onError = (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 120));
  };
  page.on("console", onError);
  await page.goto(origin + route, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(3200);

  const info = await page.evaluate(() => ({
    title: document.title,
    text: (document.getElementById("root") || {}).textContent || "",
    h: document.body.scrollHeight
  }));
  page.off("console", onError);

  const titleOk = expectTitle ? info.title.includes(expectTitle) : true;
  const contentOk = info.text.length > minText;
  const ok = titleOk && contentOk;
  if (!ok) failures += 1;

  console.log(
    `${ok ? "PASS" : "FAIL"}  ${route.padEnd(30)} title="${info.title}" text=${info.text.length} h=${info.h}${
      errors.length ? " errors=" + errors.length : ""
    }`
  );
  if (!titleOk) console.log(`      expected title to include "${expectTitle}"`);
}

await browser.close();
console.log(failures ? `${failures} route(s) failed` : "all routes ok");
process.exit(failures ? 1 : 0);
