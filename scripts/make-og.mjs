// Renders the 1200x630 social card from the live design tokens so link previews
// on Reddit carry the same art direction as the site itself.
// usage: node scripts/make-og.mjs
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, "../public/og.png");

const stages = [
  "ANNOUNCED",
  "RESEARCH",
  "EARLY WIP",
  "BOOTING",
  "IN-GAME",
  "PLAYABLE",
  "COMPLETABLE",
  "RELEASED"
];

const stats = [
  ["24", "PORTS TRACKED"],
  ["21", "PLAYABLE +"],
  ["11", "RELEASED"],
  ["7", "ENGINEERS"]
];

const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1200px;
        height: 630px;
        background: #08090a;
        color: #f4f6f8;
        font-family: Inter, system-ui, sans-serif;
        position: relative;
        overflow: hidden;
      }
      .glow {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(760px 420px at 88% 8%, rgba(58, 210, 255, 0.20), transparent 62%),
          radial-gradient(620px 420px at 8% 100%, rgba(58, 210, 255, 0.07), transparent 66%);
      }
      .grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px);
        background-size: 60px 60px;
        mask-image: radial-gradient(circle at 50% 40%, #000 42%, transparent 88%);
      }
      .frame {
        position: relative;
        height: 100%;
        padding: 52px 60px 44px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .mono { font-family: "JetBrains Mono", ui-monospace, monospace; }
      .top { display: flex; align-items: center; justify-content: space-between; }
      .brand { display: flex; align-items: center; gap: 12px; }
      .dot { width: 10px; height: 10px; border-radius: 999px; background: #3ad2ff; box-shadow: 0 0 18px rgba(58,210,255,0.85); }
      .wordmark { font-size: 19px; font-weight: 700; letter-spacing: 0.30em; }
      .feeds { font-size: 11.5px; letter-spacing: 0.20em; color: #7c848d; }
      .mid { padding-top: 4px; }
      .eyebrow { font-size: 11.5px; letter-spacing: 0.34em; color: #3ad2ff; margin-bottom: 20px; }
      h1 { font-size: 68px; line-height: 1.02; letter-spacing: -0.028em; font-weight: 700; }
      h1 .dim { display: block; color: #6f7a84; }
      .lede { margin-top: 22px; max-width: 690px; font-size: 16px; line-height: 1.62; color: #a3acb5; }
      .rail { display: flex; align-items: center; gap: 7px; margin-top: 30px; }
      .step { font-size: 9.5px; letter-spacing: 0.12em; padding: 6px 9px; border: 1px solid #242830; color: #6b747d; border-radius: 2px; }
      .step.on { border-color: rgba(58,210,255,0.55); color: #3ad2ff; background: rgba(58,210,255,0.09); }
      .foot { border-top: 1px solid #242830; padding-top: 22px; display: flex; align-items: flex-end; justify-content: space-between; }
      .stats { display: flex; gap: 54px; }
      .stat .n { font-size: 38px; font-weight: 700; letter-spacing: -0.02em; }
      .stat .n.accent { color: #3ad2ff; }
      .stat .l { font-size: 9.5px; letter-spacing: 0.20em; color: #7c848d; margin-top: 6px; }
      .url { font-size: 12px; letter-spacing: 0.16em; color: #7c848d; }
      .url b { color: #f4f6f8; font-weight: 500; }
    </style>
  </head>
  <body>
    <div class="glow"></div>
    <div class="grid"></div>
    <div class="frame">
      <div class="top">
        <div class="brand"><span class="dot"></span><span class="wordmark mono">VITAHARBOR</span></div>
        <div class="feeds mono">R/VITAHACKS &nbsp;·&nbsp; R/VITAPIRACY &nbsp;·&nbsp; ZERO ROMS HOSTED</div>
      </div>

      <div class="mid">
        <div class="eyebrow mono">ONE HUB FOR EVERY PORT</div>
        <h1>Every Vita port.<span class="dim">One verified ledger.</span></h1>
        <p class="lede">Stage, hardware notes, performance and the engineer behind every PlayStation Vita port — pulled out of scattered threads and kept in one place.</p>
        <div class="rail mono">
          ${stages.map((s) => `<span class="step${s === "RELEASED" ? " on" : ""}">${s}</span>`).join("")}
        </div>
      </div>

      <div class="foot">
        <div class="stats">
          ${stats
            .map(
              ([n, l], i) =>
                `<div class="stat"><div class="n${i === 1 ? " accent" : ""}">${n}</div><div class="l mono">${l}</div></div>`
            )
            .join("")}
        </div>
        <div class="url mono"><b>vitaharbor.vercel.app</b></div>
      </div>
    </div>
  </body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
await page.screenshot({ path: out });
await browser.close();
console.log("wrote", out);
