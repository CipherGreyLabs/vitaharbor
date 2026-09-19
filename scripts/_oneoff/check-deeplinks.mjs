import fs from 'fs';

for (const slug of ['d2vita', 'rc-cars-vita']) {
  const html = fs.readFileSync('dist/web/projects/' + slug + '/index.html', 'utf8');
  const pick = (re) => (html.match(re) || [])[1] || 'MISSING';
  console.log('== ' + slug + ' ==');
  console.log('title:      ' + pick(/<title>([^<]*)<\/title>/));
  console.log('canonical:  ' + pick(/<link rel="canonical" href="([^"]*)"/));
  console.log('og:title:   ' + pick(/<meta property="og:title" content="([^"]*)"/));
  console.log('og:url:     ' + pick(/<meta property="og:url" content="([^"]*)"/));
  console.log('og:desc:    ' + pick(/<meta property="og:description" content="([^"]*)"/).slice(0, 80));
  console.log('app mount:  ' + (html.includes('id="root"') ? 'yes' : 'NO'));
  console.log('');
}

