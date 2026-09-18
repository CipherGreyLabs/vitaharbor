const base = 'https://vitaharbor.vercel.app';

const og = await fetch(base + '/og.png');
console.log('og.png ->', og.status, og.headers.get('content-type'), ((og.headers.get('content-length') || 0) / 1024).toFixed(0) + ' KB');

const html = await (await fetch(base + '/?f=' + Date.now())).text();
console.log('html bytes:', html.length);
console.log('entries in html:', (html.match(/id="entry-/g) || []).length);
console.log('Title case check:', html.includes('PlayStation Vita Port Tracker') ? 'ok' : 'missing');

