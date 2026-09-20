# VitaHarbor

An independent archive of PlayStation Vita ports, built from public engineering
threads on r/vitahacks, r/VitaPiracy and r/PSVitaHomebrew.

## What it does

The ledger is a curated, hand-verified set of entries. Each entry records the stage
a port has reached, what it does on real hardware, who is behind it and which thread
it came from. A separate scanner watches all three subreddits and records newly surfaced
threads as unverified candidates, which never reach the ledger without review.

## Layout

```
src/shared/constants/fallbackData.ts   the single authored dataset
src/shared/data/staticApi.ts           resolves /api/* from that dataset
src/worker/                            the API, deployed on Vercel Edge
src/web/routes/HomePage.tsx            the archive surface
src/web/components/projects/           ProjectMark (generated identity)
src/web/components/visual/             LiveAreaWaves (stage backdrop)
scripts/                               scanner, provenance gate, promotion, feeds, sitemap
data/quarantine.json                   internal candidate/provenance queue
tests/                                 data invariants and unit tests
docs/AUTOMATION.md                     how the scheduled chain is meant to run
```

Both the browser and the edge API read `fallbackData.ts`, so there is one source of
truth. The homepage renders from that same dataset on the first paint and treats the
API call as a refresh, which is why the list is never empty.

## Commands

```
npm run dev            local development
npm run build          production build
npm test               data invariants plus unit tests
npm run typecheck      TypeScript
 npm run data:migrate   migrate the legacy discovery queue once
 npm run data:scan      record new candidate threads in quarantine
 npm run data:list      show candidates awaiting manual review
 npm run data:inspect   inspect one internal provenance record
 npm run data:verify    move one record to VERIFIED_FOR_REVIEW with evidence
 npm run data:promote   explicitly promote one verified record with evidence
 npm run data:feeds     rebuild the JSON and RSS feeds from curated data only
```

## Rules the data must keep

`tests/unit/data.test.ts` enforces these, so a regression fails the build:

- ids and slugs stay unique
- every project carries a Reddit source URL
- every update points at a project that exists
- timestamps are absolute and in the past; deriving them from the clock is banned, so
  the archive can never look fresher than it is
- stage values come from the agreed set

Scanner output is never curated data. It follows `DETECTED -> QUARANTINED ->
VERIFIED_FOR_REVIEW -> PROMOTED` (or `REJECTED`/`BLOCKED_UNVERIFIED`). See
`docs/THREAT_MODEL_DATA_POISONING.md` and `docs/MODERATION_AND_PROMOTION.md`.

## Design system

Colour, spacing and type come from tokens declared in `src/web/styles/index.css` and
exposed as Tailwind names (`canvas`, `surface`, `sunken`, `hairline`, `ink`,
`stage.*`, `accent`). Text sizes are seven deliberate steps. Change a token rather
than a component.
