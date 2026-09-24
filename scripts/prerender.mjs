import fs from 'node:fs';
import path from 'node:path';
import { FALLBACK_PROJECTS, FALLBACK_UPDATES } from '../src/shared/constants/fallbackData.js';

const htmlPath = path.resolve(process.cwd(), 'dist/web/index.html');
if (!fs.existsSync(htmlPath)) {
  console.log('dist/web/index.html not found, skipping prerender.');
  process.exit(0);
}

let html = fs.readFileSync(htmlPath, 'utf8');

function escapeXml(unsafe) {
  return String(unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function prettyStage(stage) {
  const value = String(stage || 'wip').replace(/_/g, ' ');
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const projectItemsHtml = FALLBACK_PROJECTS.map((p, idx) => {
  const title = escapeXml(p.display_name || p.game_title || 'Untitled');
  const stage = escapeXml(prettyStage(p.current_stage));
  const notes = escapeXml(p.performance_notes || p.playability_notes || p.summary || '');
  const platform = escapeXml(p.original_platform || 'PlayStation Vita');
  const redditLink = p.reddit_url
    ? `<a href="${escapeXml(p.reddit_url)}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline">Reddit Thread</a>`
    : '';

  return `          <li id="entry-${p.slug}" class="py-4 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span class="text-xs text-gray-500 font-mono">${String(idx + 1).padStart(2, '0')} / ${platform}</span>
                <h3 class="text-base font-semibold text-gray-900">${title}</h3>
              </div>
              <div class="flex items-center gap-3">
                <span class="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-700">${stage}</span>
                ${redditLink}
              </div>
            </div>
            <p class="mt-1.5 text-sm text-gray-600">${escapeXml(p.summary || '')}</p>
            ${notes ? `<p class="mt-1 text-xs text-gray-500 font-mono">Status: ${notes}</p>` : ''}
          </li>`;
}).join('\n');

function formatUtcDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'date not recorded';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  }) + ' UTC';
}

const latestUpdatesHtml = [...FALLBACK_UPDATES]
  .sort((a, b) => new Date(b.event_at).getTime() - new Date(a.event_at).getTime())
  .slice(0, 4)
  .map((update) => {
    const title = escapeXml(update.title || 'Untitled update');
    const summary = escapeXml(update.summary || '');
    const project = escapeXml(update.project_display_name || 'Unassigned project');
    const date = escapeXml(formatUtcDateTime(update.event_at));
    const projectLink = update.project_slug
      ? `<a href="/projects/${escapeXml(update.project_slug)}/" class="text-blue-600 hover:underline">${project}</a>`
      : `<span class="text-gray-500" title="No project route is recorded">${project}</span>`;
    const source = update.sources?.[0]?.canonical_url
      ? `<a href="${escapeXml(update.sources[0].canonical_url)}" target="_blank" rel="noopener noreferrer" class="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline">Source thread</a>`
      : '';
    return `          <article class="rounded-2xl border border-gray-200 bg-white p-5">
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              ${projectLink}
              <time datetime="${new Date(update.event_at).toISOString()}">${date}</time>
            </div>
            <h3 class="mt-3 text-base font-semibold leading-snug text-gray-900">${title}</h3>
            <p class="mt-2 text-sm leading-relaxed text-gray-600">${summary}</p>
            ${source}
          </article>`;
  })
  .join('\n');

// ItemList structured data, escaped so a project title can never close the script tag.
const itemListJsonLd = JSON.stringify(
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'PlayStation Vita port projects tracked by VitaHarbor',
    numberOfItems: FALLBACK_PROJECTS.length,
    itemListElement: FALLBACK_PROJECTS.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.display_name || p.game_title || 'Untitled port',
      url: 'https://vitaharbor.vercel.app/projects/' + p.slug + '/',
      description: p.summary || ''
    }))
  },
  null,
  2
).replace(/</g, '\u003c');

const itemListScript =
  '\n    <script type="application/ld+json">\n' + itemListJsonLd + '\n    </script>\n';


// Per-project deep links. Reddit, Discord and X do not run JavaScript, so each project
// needs its own HTML with its own metadata to produce a real preview card.
const deepLinkPages = FALLBACK_PROJECTS.map((p) => {
  const title = (p.display_name || p.game_title || p.slug) + " - VitaHarbor";
  const description = p.summary || "PlayStation Vita port tracked by VitaHarbor.";
  const url = "https://vitaharbor.vercel.app/projects/" + p.slug + "/";
  const image = "https://vitaharbor.vercel.app/og/projects/" + p.slug + ".png";
  return { slug: p.slug, title, description, url, image, project: p };
});

function applyMeta(html, meta) {
  // Groups are (prefix)(old value)(suffix). The suffix must be re-emitted or the old
  // value is never actually removed.
  const swap = (source, pattern, value) =>
    source.replace(pattern, (_match, prefix, _old, suffix) => prefix + escapeXml(value) + suffix);
  let out = html;
  out = swap(out, /(<title>)([^<]*)(<\/title>)/, meta.title);
  out = swap(out, /(<meta name="description" content=")([^"]*)(")/, meta.description);
  out = swap(out, /(<link rel="canonical" href=")([^"]*)(")/, meta.url);
  out = swap(out, /(<meta property="og:title" content=")([^"]*)(")/, meta.title);
  out = swap(out, /(<meta property="og:description" content=")([^"]*)(")/, meta.description);
  out = swap(out, /(<meta property="og:url" content=")([^"]*)(")/, meta.url);
  out = swap(out, /(<meta property="og:image" content=")([^"]*)(")/, meta.image);
  out = swap(out, /(<meta name="twitter:title" content=")([^"]*)(")/, meta.title);
  out = swap(out, /(<meta name="twitter:description" content=")([^"]*)(")/, meta.description);
  out = swap(out, /(<meta name="twitter:image" content=")([^"]*)(")/, meta.image);
  out = swap(out, /(<meta property="og:image:alt" content=")([^"]*)(")/, meta.title);
  return out;
}

const prerenderedBody = `<div id="top" class="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
    <header class="border-b border-gray-200 bg-white/90 sticky top-0 z-50">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <a href="#top" class="text-lg font-semibold tracking-tight text-gray-900">VitaHarbor</a>
        <nav class="flex items-center gap-5 text-sm text-gray-600">
          <a href="/updates/" class="hover:text-gray-900">Updates</a>
          <a href="#directory" class="hover:text-gray-900">Directory</a>
          <a href="/discovery/" class="hover:text-gray-900">Discovery</a>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            ${FALLBACK_PROJECTS.length} indexed
          </span>
        </nav>
      </div>
    </header>

    <main id="main-content" class="mx-auto max-w-5xl px-6 py-16">
      <section class="text-center mb-16">
        <p class="text-xs font-medium uppercase tracking-widest text-gray-500">Community port updates</p>
        <h1 class="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">The Vita port update tracker.</h1>
        <p class="mx-auto mt-4 max-w-xl text-base text-gray-600">
          New ports, decompilations and wrappers, collected from the places where the scene actually posts them.
        </p>
      </section>

      <section id="latest-updates" class="mt-12">
        <div class="flex flex-wrap items-baseline justify-between gap-3 border-b border-gray-200 pb-4 mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Latest updates</h2>
          <span class="text-sm text-gray-500">Exact source dates</span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
${latestUpdatesHtml}
        </div>
      </section>

      <section id="directory" class="mt-12">
        <div class="flex items-baseline justify-between border-b border-gray-200 pb-4 mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Directory</h2>
          <span class="text-sm text-gray-500 font-mono">${FALLBACK_PROJECTS.length} projects indexed</span>
        </div>
        <ul class="divide-y divide-gray-100">
${projectItemsHtml}
        </ul>
      </section>

      <section id="methodology" class="mt-20 rounded-2xl border border-gray-200 bg-white p-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">How entries get listed</h2>
        <div class="grid gap-6 sm:grid-cols-3 text-sm text-gray-600">
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Sourced</h3>
            <p>Entries link to an original engineering thread when a project-specific source has been verified. Unverified candidates stay in the detection log.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Verified</h3>
            <p>Evidence levels stay visible. Detected threads remain unverified until a source-backed record is reviewed.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Non-infringing</h3>
            <p>Only discussion and source repositories are indexed. No ROMs, ISOs or game data are hosted.</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-gray-200 mt-20 py-10 text-xs text-gray-500 text-center">
      <p>VitaHarbor is an independent research index. Nothing here bypasses licensing or distributes copyrighted game data.</p>
    </footer>
  </div>`;

html = html.replace('<div id="root"></div>', '<div id="root">' + prerenderedBody + '</div>');
html = html.replace('</head>', itemListScript + '</head>');
fs.writeFileSync(htmlPath, html, 'utf8');
// Write one HTML file per project so /projects/<slug>/ has its own metadata.
const projectsDir = path.resolve(process.cwd(), "dist/web/projects");
for (const page of deepLinkPages) {
  const dir = path.join(projectsDir, page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), applyMeta(html, page), "utf8");
}
console.log('Wrote ' + deepLinkPages.length + ' project pages into dist/web/projects');

const standalonePages = [
  {
    path: "updates",
    title: "PlayStation Vita port updates - VitaHarbor",
    description: "Chronological PlayStation Vita port, decompilation and wrapper updates tracked by VitaHarbor.",
    url: "https://vitaharbor.vercel.app/updates/",
    image: "https://vitaharbor.vercel.app/og.png"
  },
  {
    path: "discovery",
    title: "Vita port discovery queue - VitaHarbor",
    description: "Public scanner detections awaiting source review before they enter the verified VitaHarbor ledger.",
    url: "https://vitaharbor.vercel.app/discovery/",
    image: "https://vitaharbor.vercel.app/og.png"
  }
];

for (const page of standalonePages) {
  const dir = path.resolve(process.cwd(), "dist/web", page.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), applyMeta(html, page), "utf8");
}
console.log('Wrote standalone pages: ' + standalonePages.map((page) => '/' + page.path + '/').join(', '));

console.log('Successfully prerendered ' + FALLBACK_PROJECTS.length + ' projects into dist/web/index.html (' + html.length + ' bytes)');
