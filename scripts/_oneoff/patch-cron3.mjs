import fs from 'fs';

let wf = fs.readFileSync('.github/workflows/reddit-scanner.yml', 'utf8');
// Replace the current 2x a day cron with a 3x a day cron
wf = wf.replace(
  "- cron: \"0 8,20 * * *\"",
  "- cron: \"0 0,8,16 * * *\""
);
wf = wf.replace(
  "Scheduled 2x a day.",
  "Scheduled 3x a day."
);
fs.writeFileSync('.github/workflows/reddit-scanner.yml', wf);

console.log("Cron updated to 3x a day (0, 8, 16).");

