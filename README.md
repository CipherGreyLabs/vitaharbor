# VitaHarbor

An independent archive of PlayStation Vita ports, built from public engineering
threads on r/vitahacks and r/VitaPiracy.

## What it does

The ledger is a curated, hand-verified set of entries. Each entry records the stage
a port has reached, what it does on real hardware, who is behind it and which thread
it came from. A separate scanner watches both subreddits and records newly surfaced
threads as unverified candidates, which never reach the ledger without review.

## Layout

```
src/shared/constants/fallbackData.ts   the single authored dataset
src/shared/data/staticApi.ts           resolves /api/* from that dataset
src/worker/                            the API, deployed on Vercel Edge
src/web/routes/HomePage.tsx            the archive surface
src/web/components/projects/           ProjectMark (generated identity)
src/web/components/visual/             LiveAreaWaves (stage backdrop)
scripts/                               scanner, promotion, feeds, sitemap
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
npm run data:scan      record new candidate threads
npm run data:list      show the candidate queue
npm run data:promote   move a candidate into the ledger, marked unverified
npm run data:feeds     rebuild the JSON and RSS feeds
```

## Rules the data must keep

`tests/unit/data.test.ts` enforces these, so a regression fails the build:

- ids and slugs stay unique
- every project carries a Reddit source URL
- every update points at a project that exists
- timestamps are absolute and in the past; deriving them from the clock is banned, so
  the archive can never look fresher than it is
- stage values come from the agreed set

## Design system

Colour, spacing and type come from tokens declared in `src/web/styles/index.css` and
exposed as Tailwind names (`canvas`, `surface`, `sunken`, `hairline`, `ink`,
`stage.*`, `accent`). Text sizes are seven deliberate steps. Change a token rather
than a component.

