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
  const notes = escapeXml(p.performance_notes || p.playability_notes || '');
  const platform = escapeXml(p.original_platform || 'PlayStation Vita');
  const stageTone = ['released', 'playable', 'completable'].includes(String(p.current_stage))
    ? 'ready'
    : String(p.current_stage) === 'in_game'
      ? 'progress'
      : String(p.current_stage) === 'booting'
        ? 'caution'
        : 'idle';
  const initials = escapeXml((p.display_name || p.game_title || 'Vita').split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase());
  const artwork = p.screenshot_url
    ? `<img class="vh-static-art-image" src="${escapeXml(p.screenshot_url)}" alt="${escapeXml(p.screenshot_alt || ('Screenshot for ' + title))}" loading="lazy" decoding="async">`
    : `<div class="vh-static-art-fallback" aria-hidden="true"><span>${initials}</span><span>${platform}</span></div>`;
  const redditLink = p.reddit_url
    ? `<a href="${escapeXml(p.reddit_url)}" target="_blank" rel="noopener noreferrer" class="vh-static-source">Open source discussion</a>`
    : '';

  return `          <li id="entry-${escapeXml(p.slug)}" class="vh-static-card">
            <div class="vh-static-art">${artwork}</div>
            <div class="vh-static-card-body">
              <div class="vh-static-card-meta"><span>${String(idx + 1).padStart(2, '0')} · ${platform}</span><span class="vh-static-stage vh-static-stage--${stageTone}">${stage}</span></div>
              <h3><a href="/projects/${escapeXml(p.slug)}/">${title}</a></h3>
              <p>${escapeXml(p.summary || '')}</p>
              ${notes ? `<p class="vh-static-notes">Project notes: ${notes}</p>` : ''}
              ${redditLink}
            </div>
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

const latestUpdate = [...FALLBACK_UPDATES]
  .sort((a, b) => new Date(b.event_at).getTime() - new Date(a.event_at).getTime())
  [0];

const latestSignalHtml = latestUpdate
  ? (() => {
      const date = escapeXml(formatUtcDateTime(latestUpdate.event_at));
      const eventDate = new Date(latestUpdate.event_at);
      const dateTime = Number.isNaN(eventDate.getTime()) ? '' : ` datetime="${eventDate.toISOString()}"`;
      const projectName = escapeXml(latestUpdate.project_display_name || 'Community update');
      const project = latestUpdate.project_slug
        ? `<a href="/projects/${escapeXml(latestUpdate.project_slug)}/">${projectName}</a>`
        : `<span>${projectName}</span>`;
      const source = latestUpdate.sources?.[0]?.canonical_url
        ? `<a href="${escapeXml(latestUpdate.sources[0].canonical_url)}" target="_blank" rel="noopener noreferrer">Open source discussion</a>`
        : '';
      return `<section class="vh-static-signal" aria-label="Latest signal">
        <div><div class="vh-static-signal-meta"><strong>Latest signal</strong><time${dateTime}>${date}</time>${project}</div><p>${escapeXml(latestUpdate.title || 'Project update')}</p></div>
        <div class="vh-static-signal-links">${source}<a href="/updates/">All updates</a></div>
      </section>`;
    })()
  : '';

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

const prerenderedBody = `<div id="top" class="vh-static-page">
    <header class="vh-static-header">
      <div class="vh-static-header-inner">
        <a href="#top" class="vh-static-brand">VitaHarbor</a>
        <nav aria-label="Sections" class="vh-static-nav">
          <a href="/updates/">Updates</a>
          <a href="#directory">Directory</a>
          <a href="/discovery/">Community posts</a>
        </nav>
      </div>
    </header>

    <main id="main-content">
      <section class="vh-static-hero">
        <div>
          <p class="vh-static-eyebrow">PlayStation Vita · ports, decompilations &amp; wrappers</p>
          <h1>A field guide to Vita ports.</h1>
          <p>Browse source-linked projects and follow what the community is building.</p>
        </div>
        <div class="vh-static-count"><strong>${FALLBACK_PROJECTS.length}</strong><span>projects in the atlas</span></div>
      </section>

      <div class="vh-static-content">
        ${latestSignalHtml}
        <section id="directory" aria-labelledby="directory-heading" class="vh-static-directory">
          <div class="vh-static-directory-heading">
            <div><p class="vh-static-eyebrow">Project index</p><h2 id="directory-heading">Directory</h2></div>
            <span>${FALLBACK_PROJECTS.length} projects</span>
          </div>
          <ul class="vh-static-projects">
${projectItemsHtml}
          </ul>
        </section>

        <section id="methodology" class="vh-static-method">
          <h2>How entries get listed</h2>
          <div>
            <article><h3>Sourced</h3><p>Entries link to an original engineering thread when a project-specific source has been verified. Unverified community posts are shown separately from the project directory.</p></article>
            <article><h3>Evidence</h3><p>Evidence levels stay visible. A community post alone does not confirm a project's status or performance.</p></article>
            <article><h3>Independent</h3><p>Only discussion and source repositories are indexed. No ROMs, ISOs or game data are hosted.</p></article>
          </div>
        </section>
      </div>
    </main>

    <footer class="vh-static-footer">
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
    title: "Community posts - VitaHarbor",
    description: "Recent Reddit posts about possible Vita ports and updates. Posts are unverified leads, not confirmed project records.",
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
