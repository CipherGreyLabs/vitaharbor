const base = 'https://vitaharbor.vercel.app';

const paths = [
  '/projects/d2vita/',
  '/projects/d2vita',
  '/projects/openmohaa-vita/',
  '/sitemap.xml',
  '/',
];

for (const p of paths) {
  const res = await fetch(base + p + '?t=' + Date.now());
  const body = await res.text();
  const title = (body.match(/<title>([^<]*)<\/title>/) || [])[1] || 'MISSING';
  const canonical = (body.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || 'MISSING';
  console.log(p);
  console.log('   status ' + res.status + '  cache ' + (res.headers.get('cache-control') || 'none'));
  console.log('   title: ' + title);
  console.log('   canonical: ' + canonical);
  console.log('');
}

