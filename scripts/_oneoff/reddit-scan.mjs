const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VitaHarborLedger/1.0';
const subs = ['vitahacks', 'VitaPiracy'];
const keyword = /port|homebrew|wip|release|decomp|wrapper|android|engine|demo|vitaGL|porting/i;

for (const sub of subs) {
  const url = 'https://www.reddit.com/r/' + sub + '/new.json?limit=60';
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' } });
    console.log('=== r/' + sub + ' HTTP ' + res.status + ' ===');
    if (!res.ok) { console.log((await res.text()).slice(0, 200)); continue; }
    const body = await res.json();
    const posts = body?.data?.children?.map(c => c.data) || [];
    console.log('posts:', posts.length);
    for (const p of posts) {
      const d = new Date(p.created_utc * 1000).toISOString().slice(0, 10);
      const hit = keyword.test(p.title) ? 'HIT' : '   ';
      console.log(hit, d, '| ' + p.author + ' | ' + p.title.slice(0, 110));
      if (hit === 'HIT') console.log('        https://www.reddit.com' + p.permalink);
    }
  } catch (e) {
    console.log('r/' + sub + ' FAILED: ' + e.message);
  }
}

