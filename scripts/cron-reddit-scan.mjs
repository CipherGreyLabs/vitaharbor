import fs from 'fs';

const SUBREDDITS = ['vitahacks', 'VitaPiracy'];
const USER_AGENT = 'web:vitaharbor.app:v1.0.0 (by /u/VitaHarborLedger)';

const PORT_KEYWORDS = ['port', 'decomp', 'decompilation', 'wrapper', 'vitagl', 'armv7', 'engine', 'unity', 'source engine', 'openmohaa'];
const STAGE_KEYWORDS = ['release', 'wip', 'boot', 'in-game', 'playable', 'fps', 'tested'];

function parseRssEntries(xml) {
  const entries = [];
  const items = xml.split('<entry>');
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    const titleMatch = item.match(/<title>([^<]+)<\/title>/);
    const linkMatch = item.match(/<link href="([^"]+)"/);
    const authorMatch = item.match(/<name>([^<]+)<\/name>/);
    const dateMatch = item.match(/<updated>([^<]+)<\/updated>/);
    const contentMatch = item.match(/<content type="html">([\s\S]*?)<\/content>/);

    if (titleMatch && linkMatch) {
      entries.push({
        title: titleMatch[1].trim(),
        url: linkMatch[1],
        author: authorMatch ? authorMatch[1].replace('/u/', '') : 'community',
        updated: dateMatch ? dateMatch[1] : new Date().toISOString(),
        content: contentMatch ? contentMatch[1] : ''
      });
    }
  }
  return entries;
}

async function runScan() {
  console.log('=== VitaHarbor Autonomous Reddit RSS Scanner ===');
  const discovered = [];

  for (const sub of SUBREDDITS) {
    try {
      console.log(`Scanning r/${sub} RSS feed...`);
      const res = await fetch(`https://www.reddit.com/r/${sub}/new.rss`, {
        headers: { 'User-Agent': USER_AGENT }
      });
      if (!res.ok) {
        console.warn(`RSS failed for r/${sub}: ${res.status}`);
        continue;
      }
      const text = await res.text();
      const entries = parseRssEntries(text);
      console.log(`Found ${entries.length} posts in r/${sub}`);

      for (const e of entries) {
        const titleLower = e.title.toLowerCase();
        const contentLower = e.content.toLowerCase();
        const isPort = PORT_KEYWORDS.some(k => titleLower.includes(k) || contentLower.includes(k));
        const isProgress = STAGE_KEYWORDS.some(k => titleLower.includes(k));

        if (isPort || isProgress) {
          discovered.push({
            subreddit: sub,
            title: e.title,
            url: e.url,
            author: e.author,
            updated: e.updated
          });
        }
      }
    } catch (err) {
      console.error(`Failed scan on r/${sub}:`, err.message);
    }
  }

  console.log(`Discovered ${discovered.length} port-relevant discussions.`);
  if (discovered.length > 0) {
    discovered.slice(0, 5).forEach(d => {
      console.log(`- [r/${d.subreddit}] ${d.title} by u/${d.author}`);
    });
  }
  console.log('=== Scan Finished Successfully ===');
}

runScan();
