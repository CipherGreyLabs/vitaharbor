import fs from 'fs';
import path from 'path';
import { FALLBACK_PROJECTS } from '../src/shared/constants/fallbackData';

if (!fs.existsSync('public/api')) {
  fs.mkdirSync('public/api', { recursive: true });
}

const jsonFeed = {
  version: "https://jsonfeed.org/version/1.1",
  title: "VitaHarbor — PS Vita Port Development Ledger",
  home_page_url: "https://vitaharbor.vercel.app/",
  feed_url: "https://vitaharbor.vercel.app/api/feed.json",
  description: "Automated index tracking community PlayStation Vita ports, ARM wrappers, and decompilations from r/vitahacks and r/VitaPiracy.",
  items: FALLBACK_PROJECTS.map(p => ({
    id: p.slug,
    url: p.reddit_url || `https://vitaharbor.vercel.app/projects/${p.slug}`,
    title: p.display_name || p.game_title,
    content_text: `Stage: ${p.current_stage} | Platform: ${p.original_platform} | Summary: ${p.summary} | Hardware: ${p.performance_notes || p.playability_notes || 'Tested on real hardware.'}`,
    date_modified: p.last_activity_at ? new Date(p.last_activity_at).toISOString() : new Date().toISOString(),
    tags: [p.current_stage, p.original_platform, ...(p.technologies || [])].filter(Boolean)
  }))
};

fs.writeFileSync('public/api/feed.json', JSON.stringify(jsonFeed, null, 2), 'utf8');

const rssItems = FALLBACK_PROJECTS.map(p => `    <item>
      <title><![CDATA[${p.display_name || p.game_title} - ${String(p.current_stage).toUpperCase()}]]></title>
      <link>${p.reddit_url || `https://vitaharbor.vercel.app/projects/${p.slug}`}</link>
      <guid isPermaLink="false">${p.slug}</guid>
      <pubDate>${new Date(p.last_activity_at || Date.now()).toUTCString()}</pubDate>
      <description><![CDATA[${p.summary} Hardware Status: ${p.performance_notes || p.playability_notes || 'ARMv7 execution.'}]]></description>
    </item>`).join('\n');

const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>VitaHarbor — PS Vita Port Ledger</title>
    <link>https://vitaharbor.vercel.app/</link>
    <description>Community PlayStation Vita ports tracked from r/vitahacks and r/VitaPiracy</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>`;

fs.writeFileSync('public/api/rss.xml', rssXml, 'utf8');
console.log('Feeds created successfully in public/api/');
