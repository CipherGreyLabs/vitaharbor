# VitaHarbor — Volledige Handover

> Bedoeld om dit project met **eender welk LLM of welke ontwikkelaar** verder te zetten
> zonder enige voorkennis. Lees dit bestand volledig voor je iets wijzigt.
> Laatst bijgewerkt: **2026-09-16**

---

## 0. TL;DR voor de volgende agent

| Vraag | Antwoord |
|---|---|
| Wat is het? | Centrale hub voor **alle PS Vita game-ports**, die nu verspreid staan over r/VitaPiracy en r/vitahacks |
| Live URL | **https://vitaharbor.vercel.app** |
| Status | **Online en werkend.** Statische momentopname, geen live ingestie |
| Stack | React 19 + Vite + Tailwind + React Router 7 + Three.js (frontend); Hono + Cloudflare Workers + D1 (backend, in repo maar niet actief op Vercel) |
| Repo | C:/Users/suloW/Documents/ChatGPT/VitaPort — git branch main, schone working tree |
| Grootste openstaande punt | Echte auto-updates aanzetten (vereist Cloudflare-login + Reddit API-credentials, zie §10) |
| Harde regel | **Zero piracy.** Nooit ROMs, ISOs, keys of downloadlinks naar games hosten of linken |

---

## 1. Doel van het project

Het PS Vita-port-ecosysteem is technisch ambitieus maar extreem versnipperd: aankondigingen,
first-boot-milestones, beta-builds en framerate-rapporten leven in losse Reddit-threads,
comment-replies en GitHub-gists. Er is geen centrale plek.

VitaHarbor is die centrale plek. Het beantwoordt een vraag:

> **Welke PS Vita-ports zijn er, wie maakt ze, hoe ver staan ze, en wat is er recent veranderd?**

Per port toont de site: huidige stage, lifecycle, playability-notities, performance-notities,
engine/technologie, de betrokken engineers, en de volledige stage-tijdlijn met bronverwijzing.

### Harde productregels (niet onderhandelbaar)

1. **Geen piracy.** Alleen publieke development-informatie. Geen ROMs, ISOs, keys of downloads.
2. **Geen verzonnen cijfers.** Alleen discrete stages, nooit "73% done". De stage-ladder is:
   announced -> research -> early_wip -> booting -> in_game -> playable -> completable -> released
3. **Provenance is heilig.** Elke claim linkt terug naar de originele bron (Reddit-thread, GitHub).
4. **Geen AI-slop UI.** Zie §8. Deze richting is meerdere keren expliciet afgewezen en daarna goedgekeurd.
5. **Geen "Makkavelli" en geen "ChatGPT"** in de site. De naam is **VitaHarbor**.

---

## 2. Huidige live staat (geverifieerd 2026-09-16)

Productie: https://vitaharbor.vercel.app

| Endpoint | Resultaat |
|---|---|
| / | 200, eigen titel, echte data |
| /projects /developers /updates /about | 200 |
| /projects/:slug en /developers/:slug | 200, eigen titel per record |
| onbekende route | 200 + 404-pagina (SPA-gedrag) |
| /api/stats | {"total_projects":24,"active_projects":24,"playable_or_better":21,"released_projects":11,"total_developers":7,"recent_updates_count":6} |
| /api/projects?limit=100 | 24 rijen |
| /og.png | 200 image/png, 1200x630 |
| /sitemap.xml | 200, 36 URLs |
| /robots.txt | 200 |

**Dataset:** 24 ports, 21 playable of verder, 11 released, 7 engineers, 6 updates.

Alle routes zijn live gecontroleerd met scripts/_oneoff/check-live.mjs (8/8 PASS).

---

## 3. Repository-overzicht

    VitaPort/
    ├── index.html                  # SPA shell + meta/OG/Twitter tags
    ├── vercel.json                 # Vercel build + rewrites (BELANGRIJK, zie §6)
    ├── wrangler.jsonc              # Cloudflare Worker + D1 + cron (NIET actief op Vercel)
    ├── api/index.ts                # Vercel Edge Function -> src/worker/index
    ├── package.json
    ├── migrations/                 # D1 SQL: 0001_initial, 0002_seed, 0003_indexes
    ├── public/                     # favicon.svg, robots.txt, og.png, sitemap.xml
    ├── scripts/                    # build- en verificatietools (zie §9)
    ├── src/
    │   ├── shared/                 # domeinlogica, types, dataset — GEEN React
    │   │   ├── constants/fallbackData.ts   # de curated dataset (24 ports)
    │   │   ├── constants/index.ts          # STAGE_ORDER, thresholds, subreddits
    │   │   ├── data/staticApi.ts           # dependency-vrije API-resolver
    │   │   ├── types/index.ts
    │   │   └── utils/index.ts
    │   ├── web/                    # React frontend
    │   │   ├── App.tsx             # routes
    │   │   ├── routes/             # 9 paginas
    │   │   ├── components/         # 3d/ layout/ projects/ developers/ updates/ ui/
    │   │   ├── lib/api.ts          # live-eerst, fallback-tweede client
    │   │   ├── lib/useDocumentMeta.ts
    │   │   └── styles/index.css
    │   └── worker/                 # Hono backend + Reddit ingestie (zie §5)
    └── tests/                      # 9 testfiles, 42 tests

Git: branch main. Laatste commits:

    6633aab Ignore local verification captures
    d20f139 Stack the hero on small screens so copy never sits on the console
    d2790e5 Keep deployment scratch files out of the repository
    4b06b56 Add per-route metadata, social card and sitemap
    2ecde86 Serve real data through a static fallback resolver and rebuild the hero stage framing
    c2f2c7d Ignore local screenshot artifacts
    3a1edab Rebuild 3D hero as a true PS Vita with IBL, bloom and readable OLED stage rail
    3c7130a Add interactive Three.js Vita viewport, port matrix ledger, and full 24-port fallback dataset

---

## 4. Lokaal draaien

Vereist: Node >= 20, npm >= 10.

    cd C:/Users/suloW/Documents/ChatGPT/VitaPort
    npm install
    npm run dev        # Vite dev-server

De frontend werkt **zonder** backend: apiGet() valt automatisch terug op de gebundelde dataset.
Je hebt dus geen database of credentials nodig om de site te bekijken of te wijzigen.

Optioneel (echte API lokaal):

    npm run db:migrate:local   # D1 migraties lokaal
    npm run seed:dev           # seed data
    npm run dev:worker         # Worker op 127.0.0.1:8787

---

## 5. Architectuur

### Twee onafhankelijke lagen

**Laag A — Frontend (draait overal, ook op Vercel):**

    React route
      └─ apiGet<T>(path, rowsKey?)        [src/web/lib/api.ts]
           ├─ 1. fetch("/api/...") met 3,5s timeout
           │     - weigert niet-OK
           │     - weigert HTML-antwoorden (een statische host geeft index.html terug)
           │     - live data WINT altijd als die bruikbaar is
           └─ 2. resolveStaticApi(path)     [src/shared/data/staticApi.ts]
                 - leest uit fallbackData.ts
                 - dekt /stats, /projects, /projects/:slug,
                   /developers, /developers/:slug, /updates, /games/:slug

**Laag B — Backend (in repo, draait op Cloudflare Workers + D1):**

    Reddit API (OAuth2)
      └─ services/reddit/redditClient.ts
           └─ services/discovery/ingestionRunner.ts   (cron: elke 15 min)
                └─ Source Items -> Observations -> Verified Updates
                     └─ matching/projectMatcher.ts + developerMatcher.ts
                          └─ D1 database
                               └─ routes/public.ts  ->  /api/*

### De kritieke valkuil die al een halve dag kostte

Op Vercel bestaat **geen D1-binding**. public.ts controleert op c.env.DB en serveert zonder
database exact dezelfde fallbackData uit de repo. Zonder de fallback-chain in api.ts gaf elke
/api/*-call de HTML-pagina terug en toonde de site **nul data**. Die chain is nu het vangnet.

**Als de site ooit leeg lijkt: check eerst of apiGet nog correct terugvalt, niet de React-code.**

---

## 6. Deployment (Vercel)

Het project staat op Vercel, project vitaharbor (.vercel/project.json).

    npx vercel --prod --yes

- Duurt circa 35 seconden. De alias https://vitaharbor.vercel.app wordt automatisch bijgewerkt.
- vercel.json heeft twee rewrites: /api/(.*) -> /api, en al het overige -> /index.html
  (SPA-routering).
- **CDN-cache:** direct na een deploy kan een alias nog een oud bestand serveren. Wacht circa
  30 seconden of test op de unieke deployment-URL. Dit gaf eerder een valse melding dat
  /og.png HTML zou zijn.

Cloudflare (staat klaar, is **niet** actief):

    npm run deploy            # wrangler deploy --env production
    npm run deploy:staging

---

## 7. Wat af is

- Volledige React-frontend met 9 routes, responsive van 390px tot desktop.
- 3D PS Vita-hero (Three.js) met IBL, bloom en een OLED-stage-rail die de geselecteerde port toont.
- Interactieve "port compatibility matrix": klik een rij en de console laadt die port. De
  bijhorende instructietekst is geen holle belofte, de interactie werkt echt.
- Echte datalaag met live-eerst/fallback-tweede resolutie over alle publieke leesroutes.
- Per-route documenttitel en meta, OG/Twitter-tags, 1200x630 share-kaart, sitemap, robots.txt.
- Volledige backend in de repo: Reddit-client, discovery-engine, project- en dev-matching,
  provenance-service, D1-migraties, cron-configuratie.
- 42 tests groen, typecheck en lint schoon, productie-build slaagt.

---

## 8. Design system (niet afwijken zonder reden)

Eerdere iteraties werden afgewezen als "AI slop". De huidige richting is goedgekeurd: een
samenhangend **"milled aluminium + cyaan"** systeem, editorial en technisch. Geen boxen,
geen glow-spam, geen standaard donker template.

### Kleurtokens (src/web/styles/index.css)

| Token | Waarde | Gebruik |
|---|---|---|
| --bg-oled | #08090a | pagina-achtergrond |
| --surface-panel | #0f1113 | panelen |
| --surface-card | #15181b | kaarten |
| --surface-hover | #1c2024 | hover |
| --border-subtle | #242830 | hairlines |
| --border-bright | #343a42 | sterke randen |
| --vita-cyan | #3ad2ff | enige accentkleur |
| --text-high | #f4f6f8 | koppen |
| --text-mid | #a3acb5 | body |
| --text-low | #7c848d | meta |

Typografie: Inter voor tekst, JetBrains Mono voor labels, cijfers en metadata.

### Structurele regels

- Een record is een **typografisch blok met een hairline erboven**, geen box
  (.terminal-panel / .card-panel = transparant, alleen border-top).
- Boxen zijn gereserveerd voor dingen waar de gebruiker iets mee doet: kaarten, filters, knoppen.
- De stage-rail is de enige plek met een "hardware"-gevoel; gebruik hem spaarzaam.
- Nooit een percentage tonen. Alleen stages.

---

## 9. Scripts

| Script | Doel |
|---|---|
| scripts/make-og.mjs | Rendert public/og.png (1200x630) uit de design-tokens. Draai na tokenwijziging: npm run assets:og |
| scripts/make-sitemap.mjs | Bouwt public/sitemap.xml uit de live API. Draai na datasetwijziging: npm run assets:sitemap |
| scripts/_oneoff/check-live.mjs | Playwright-smoketest over 8 routes: titel, data, geen console-errors |
| scripts/shot.mjs | Screenshot-helper: node scripts/shot.mjs <url> <out.png> [full|scrollY] [breedte] [hoogte] |
| scripts/take-page-shot.mjs, take-section-shot.mjs, take-screenshot.mjs | Extra screenshot-varianten |
| scripts/seed-dev.ts | Seedt lokale D1 |
| scripts/reddit-backfill.ts | Vult historische Reddit-data |

---

## 10. Het echte openstaande punt: auto-updates

De site is nu een **momentopname**. De motor voor automatische updates is volledig gebouwd maar
draait niet, omdat hij Cloudflare + Reddit-credentials vereist die niet aanwezig zijn.

Wat er nodig is:

1. **Cloudflare-login.** npx wrangler login (opent een browser op het account van de eigenaar).
2. **Reddit API-credentials.** Een script-app op reddit.com/prefs/apps, daarna
   REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET en REDDIT_REFRESH_TOKEN in .dev.vars
   (het enige aanwezige bestand is .env.example).
3. Daarna: D1-database aanmaken, npm run db:migrate:remote, en de worker deployen zodat de
   cron van elke 15 minuten loopt.

Zolang dat niet gebeurt, verandert de site niet mee met nieuwe Reddit-threads. Nieuwe ports
toevoegen betekent dan handmatig src/shared/constants/fallbackData.ts bewerken.

---

## 11. Verificatie-checklist (draai dit voor elke deploy)

    npm run typecheck        # moet schoon zijn
    npm run lint             # moet schoon zijn (0 warnings)
    npm test                 # 42 tests, 9 files
    npm run build            # dist/web

Daarna:

    npx vercel --prod --yes
    node scripts/_oneoff/check-live.mjs
    node scripts/shot.mjs https://vitaharbor.vercel.app check_home.png full 1440 900

Let op: jsdom gooit WebGL-fouten tijdens npm test. Dat is verwachte ruis, geen falende test.

---

## 12. Valkuilen en lessen (belangrijk)

1. **Nooit de open Chrome-vensters van de gebruiker aanraken.** Gebruik headless Playwright.
2. **apply_patch kan dezelfde file niet twee keer in een patch aanraken.** Splits in losse calls.
3. **PowerShell heeft geen heredocs.** Lange inline node -e met newlines faalt; schrijf een
   .mjs-bestand en run dat.
4. **Bestandsverwijdering via PowerShell met variabelen/globs wordt geblokkeerd door beleid.**
   Gebruik expliciete paden of laat git de bestanden negeren.
5. **Screenshot-artefacten** (dev_*.png, shot_*.png, f_*.png, m_*.png, check_*.png) staan in
   .gitignore. Commit ze niet.
6. **view_image vreet context.** Bekijk een afbeelding per keer.
7. Project-slugs eindigen op -vita (bijv. gta-san-andreas-vita, simpsons-hit-and-run-vita).
8. De API geeft current_stage, niet status. Er is geen veld met de naam status.
9. /api/projects heeft een default limit van 20 terwijl er 24 ports zijn. Vraag altijd
   limit=100 op als je alles wil.
10. Het conversiescript scripts/_oneoff/palette-shift.mjs is al toegepast. Niet opnieuw draaien.
11. De "Released"-tegel op de homepage valt terug op 15 als de stats-call faalt, terwijl de
    echte waarde 11 is. Kleine inconsistentie; alleen zichtbaar bij een falende API.

---

## 13. Accountgegevens en eigendom

- Vercel-project: vitaharbor, org anonymusv1605-8308. Ingelogd op deze machine.
- Cloudflare: niet ingelogd.
- Reddit API: geen credentials.
- Domein: alleen de vercel.app-subdomein. Geen eigen domein.

---

## 14. Disclaimer

Unofficial community project. Not affiliated with Sony Interactive Entertainment, Reddit, or
any represented game publishers. Er worden geen ROMs of auteursrechtelijk beschermd
spelmateriaal gehost of gelinkt.

---

## 15. Klaar-om-te-plakken prompt voor een ander LLM

Geef het andere model dit bestand (of de repo) mee en gebruik deze tekst:

> Je neemt het project VitaHarbor over. Lees HANDOVER.md in de root volledig voor je iets doet.
> Het is een centrale hub voor PS Vita game-ports, live op https://vitaharbor.vercel.app.
> Werk autonom door: geen vragen stellen, niet stoppen tot de taak af is en online staat.
> Houd je aan de harde regels in §1 (zero piracy, geen verzonnen cijfers, provenance, geen
> AI-slop UI) en aan het design system in §8. Draai voor elke deploy de checklist in §11.
> Respecteer de valkuilen in §12. Als de site leeg lijkt, debug dan eerst de fallback-chain
> in src/web/lib/api.ts, niet de React-code.
