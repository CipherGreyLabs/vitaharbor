// Vercel Cron Job - Reddit port scanner (Edge runtime, read-only).
// Fetches r/vitahacks and r/VitaPiracy RSS, classifies posts, logs results.
// Schedule: 0 7,13,19 * * * (UTC) = 09:00, 15:00, 21:00 Brussels.
// Does NOT write to disk on Vercel - runs locally via node scripts/cron-reddit-scan.mjs.

export const config = { runtime: "edge" };

const USER_AGENT = "web:vitaharbor.app:v1.0.0 (by /u/VitaHarborLedger)";

const DEV_SIGNALS = [
  /\[wip\]/i, /\[release\]/i, /\bwip\b/i, /\brelease\b/i,
  /\bin.?game\b/i, /\bplayable\b/i, /\bboots\b/i, /\bported\b/i,
  /\bprogress\b/i, /\bupdate\b/i, /\bdemo\b/i, /\bbounty\b/i,
  /github\.com\b/i, /\bvitagl\b/i, /\barmv7\b/i, /\bfps\b/i,
  /arrived!/i, /is here/i, /\bport\s+progress\b/i,
];

const Q_SIGNALS = [
  /\?/, /\bany(?:one|body)\b.*\b(?:port|know|working)\b/i,
  /\bcan (?:someone|anyone|we|you|i)\b/i,
  /\bwould (?:be|love|like)\b.*\bport\b/i,
  /\bis (?:it|there|this) (?:possible|a port|being ported|ported)\b/i,
  /\bwhen (?:will|is)\b/i, /\bhow (?:to|do I|can I)\b.*\bport\b/i,
  /\blooking for\b/i, /\bneed help\b/i,
];

const PASSIVE = ["port","ports","engine","unity","wrapper","release","homebrew"];

function classify(title: string, body: string) {
  const t = title.toLowerCase(); const b = body.toLowerCase(); const f = t+" "+b;
  const dev = DEV_SIGNALS.filter(r => r.test(t)||r.test(b));
  const q   = Q_SIGNALS.filter(r => r.test(t)||r.test(b));
  const pas = PASSIVE.filter(w => f.includes(w));
  if (Q_SIGNALS.some(r=>r.test(title)) && dev.length < 3)
    return { accept:false, conf:"low", reason:"question title ("+dev.length+" dev signals)" };
  if (dev.length >= 3)
    return { accept:true, conf:"high", reason:dev.length+" dev signals" };
  if (dev.length >= 1 && q.length === 0 && pas.length >= 1)
    return { accept:true, conf:"medium", reason:dev.length+" dev, "+pas.length+" passive, no questions" };
  return { accept:false, conf:"low", reason:"dev="+dev.length+" q="+q.length+" pas="+pas.length };
}

function parseRSS(xml: string) {
  const out: {title:string;url:string;author:string;body:string}[] = [];
  for (const chunk of xml.split("<entry>").slice(1)) {
    const pick = (re: RegExp) => { const m=chunk.match(re); return m?m[1].trim():""; };
    const title = pick(/<title>([\s\S]*?)<\/title>/).replace(/<![\s\S]*?>/g,"");
    const url   = pick(/<link href="([^"]+)"/);
    const author = pick(/<name>([^<]+)<\/name>/);
    const body  = pick(/<content[^>]*>([\s\S]*?)<\/content>/).replace(/<[^>]+>/g," ").slice(0,400);
    if (title && url) out.push({title,url,author,body});
  }
  return out;
}

async function scanSub(sub: string) {
  try {
    const r = await fetch("https://www.reddit.com/r/"+sub+"/new.rss",
      { headers:{"User-Agent":USER_AGENT} });
    if (!r.ok) return { sub, error:"HTTP "+r.status, entries:[] };
    const entries = parseRSS(await r.text());
    const accepted = entries.flatMap(e => {
      const cls = classify(e.title, e.body);
      return cls.accept ? [{ title:e.title, url:e.url, author:e.author, conf:cls.conf, reason:cls.reason }] : [];
    });
    return { sub, total:entries.length, accepted };
  } catch(e) {
    return { sub, error:String(e), entries:[] };
  }
}

export default async function handler() {
  const [vh, vp] = await Promise.all([scanSub("vitahacks"), scanSub("VitaPiracy")]);
  const result = { scanned_at: new Date().toISOString(), vitahacks: vh, vitapiracy: vp };
  console.log("[cron-scan]", JSON.stringify(result));
  return Response.json(result);
}
