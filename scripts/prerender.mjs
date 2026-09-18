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
  const redditUrl = escapeXml(p.reddit_url || '#');

  return `          <li id="entry-${p.slug}" class="py-4 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span class="text-xs text-gray-500 font-mono">${String(idx + 1).padStart(2, '0')} / ${platform}</span>
                <h3 class="text-base font-semibold text-gray-900">${title}</h3>
              </div>
              <div class="flex items-center gap-3">
                <span class="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-700">${stage}</span>
                <a href="${redditUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline">Reddit Thread</a>
              </div>
            </div>
            <p class="mt-1.5 text-sm text-gray-600">${escapeXml(p.summary || '')}</p>
            ${notes ? `<p class="mt-1 text-xs text-gray-500 font-mono">Status: ${notes}</p>` : ''}
          </li>`;
}).join('\n');

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
      url: 'https://vitaharbor.vercel.app/#p=' + p.slug,
      description: p.summary || ''
    }))
  },
  null,
  2
).replace(/</g, '\u003c');

const itemListScript =
  '\n    <script type="application/ld+json">\n' + itemListJsonLd + '\n    </script>\n';

const prerenderedBody = `<div id="top" class="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
    <header class="border-b border-gray-200 bg-white/90 sticky top-0 z-50">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <a href="#top" class="text-lg font-semibold tracking-tight text-gray-900">VitaHarbor</a>
        <nav class="flex items-center gap-5 text-sm text-gray-600">
          <a href="#directory" class="hover:text-gray-900">Directory</a>
          <a href="#methodology" class="hover:text-gray-900">Methodology</a>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            ${FALLBACK_PROJECTS.length} indexed
          </span>
        </nav>
      </div>
    </header>

    <main id="main-content" class="mx-auto max-w-5xl px-6 py-16">
      <section class="text-center mb-16">
        <p class="text-xs font-medium uppercase tracking-widest text-gray-500">Independent hardware archive</p>
        <h1 class="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">PlayStation Vita port archive.</h1>
        <p class="mx-auto mt-4 max-w-xl text-base text-gray-600">
          Engine decompilations, ARM wrappers and homebrew builds documented at the moment they surface on community engineering boards.
        </p>
      </section>

      <section id="directory" class="mt-12">
        <div class="flex items-baseline justify-between border-b border-gray-200 pb-4 mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Directory</h2>
          <span class="text-sm text-gray-500 font-mono">${FALLBACK_PROJECTS.length} verified projects</span>
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
            <p>Every entry links to the original engineering thread on r/vitahacks or r/VitaPiracy.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">Verified</h3>
            <p>Stage and performance notes come from the people running the build on real hardware.</p>
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
console.log('Successfully prerendered ' + FALLBACK_PROJECTS.length + ' projects into dist/web/index.html (' + html.length + ' bytes)');
