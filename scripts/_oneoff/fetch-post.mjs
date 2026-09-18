const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function tryGet(url) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, accept: '*/*' } });
    return { status: r.status, text: r.ok ? await r.text() : '' };
  } catch (e) { return { status: 'ERR', text: e.message }; }
}

const targets = [
  'https://www.reddit.com/r/vitahacks/comments/1wjn8zg/.rss',
  'https://old.reddit.com/r/vitahacks/comments/1wjn8zg/.rss',
  'https://www.reddit.com/r/VitaPiracy/new/.rss',
];

for (const t of targets) {
  const res = await tryGet(t);
  console.log('== ' + t + ' -> ' + res.status + ' len=' + res.text.length);
  if (res.text) {
    const content = res.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(content.slice(0, 700));
  }
  console.log('');
}

