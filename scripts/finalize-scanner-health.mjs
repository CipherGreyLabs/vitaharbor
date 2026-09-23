import fs from "node:fs";
import path from "node:path";
import { finalizeGithubActionHealth } from "./reddit-scan-health.mjs";

const output = path.resolve(process.cwd(), "public/data/scanner-health.json");
const health = JSON.parse(fs.readFileSync(output, "utf8"));
const finalized = finalizeGithubActionHealth(health, {
  run_id: process.env.GITHUB_RUN_ID || null,
  event: process.env.GITHUB_EVENT_NAME || null,
  sha: process.env.GITHUB_SHA || null
});
fs.writeFileSync(output, JSON.stringify(finalized, null, 2) + "\n", "utf8");
console.log("recorded GitHub Action success for run " + (finalized.github_action.run_id || "unknown"));
