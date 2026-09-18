import fs from 'fs';

// 1. Restore GitHub Actions Schedule
let wf = fs.readFileSync('.github/workflows/reddit-scanner.yml', 'utf8');
wf = wf.replace(
  "on:\n  workflow_dispatch:",
  "on:\n  schedule:\n    - cron: \"0 8,20 * * *\"\n  workflow_dispatch:"
);
wf = wf.replace(
  "# Automatic cron schedules are completely disabled to save tokens/resources.",
  "# Runs completely free on GitHub Actions (0 Codex tokens). Scheduled 2x a day."
);
fs.writeFileSync('.github/workflows/reddit-scanner.yml', wf);

// 2. Update Documentation
let doc = fs.readFileSync('docs/AUTOMATION.md', 'utf8');
doc = doc.replace(
  "Scheduled scanning is disabled. Discovery only runs manually on explicit invocation\nto prevent unwanted token or background API resource consumption.",
  "Scheduled scanning runs completely free via **GitHub Actions**. It triggers twice a day,\nfetches Reddit, and commits candidates back to the repo without using Codex tokens."
);
fs.writeFileSync('docs/AUTOMATION.md', doc);

console.log("GitHub Actions Cron Restored");

