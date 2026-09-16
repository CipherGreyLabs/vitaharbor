# VitaPortWatch
## Definitive Production Blueprint V2

**Purpose:** Build a production-quality, zero-cost-first web application for tracking active PS Vita game-port development, with Reddit as the only automated external discovery source in V1.

This document is the authoritative specification.

If older plans, TODOs, prototypes, notes or architecture documents conflict with this blueprint, **this blueprint wins**.

---

# 1. Core product definition

VitaPortWatch answers one primary question:

> What PS Vita game ports are currently being developed, by whom, how far have they progressed, and what changed recently?

The application is a **development intelligence tracker**, not:

- a generic PS Vita database
- a VitaDB replacement
- a homebrew store
- a piracy/download portal
- a news blog
- a forum
- a social network
- a ROM/VPK/APK mirror
- a complete historical catalog of every Vita port ever released

The core entities are:

```text
Game
  ↓
Port Project
  ↓
Developers
  ↓
Development history
  ↓
Evidence / observations
  ↓
Public updates
```

Reddit is the discovery source.

VitaPortWatch remains the structured knowledge layer.

---

# 2. Primary V1 scope

V1 must track:

```text
Active PS Vita game-port projects
Development progress
Developers
Known Reddit identities
Development milestones
Status progression
Reddit posts
Relevant Reddit comments
Recently resumed projects
Recently stalled projects
Projects reaching release
```

Automated external discovery is limited to Reddit.

Initially monitor:

```text
r/VitaPiracy
r/vitahacks
```

The list must be configurable.

---

# 3. Explicit V1 non-goals

Do NOT implement:

```text
GitHub crawling
Discord scraping/integration
GameBrew ingestion
VitaDB ingestion
Zealous Chuck ingestion
RSS ingestion
public user accounts
community comments
voting
likes
followers
push notifications
email digests
AI APIs
embeddings
vector databases
paid services
public submissions requiring accounts
game downloads
VPK hosting
APK hosting
ROM hosting
game-data hosting
ads
payments
premium plans
mobile app
```

Do not introduce these because they appear convenient.

Architecture may leave clean extension points for future sources.

Do not implement future sources in V1.

---

# 4. Product principles

Prioritize, in order:

```text
1. Correctness
2. Provenance
3. Maintainability
4. Moderation efficiency
5. Information clarity
6. Performance
7. Visual polish
8. Feature count
```

If forced to choose between more features and a smaller reliable system, choose the reliable system.

Never fabricate information to make pages visually fuller.

---

# 5. Hard architecture invariants

These rules are non-negotiable.

## 5.1 Game is not Port Project

A game represents the original game identity.

A port project represents one concrete attempt to bring that game to PS Vita.

Example:

```text
Half-Life 2
│
├── Vita Port A
│   ├── Developer A
│   └── Native Source-based approach
│
└── Vita Port B
    ├── Developer B
    └── Different implementation
```

Multiple independent Vita ports of the same game must be possible without hacks.

---

## 5.2 Reddit source is not public update

A Reddit post/comment is evidence.

It is not itself the structured VitaPortWatch fact.

Use:

```text
Source Item
    ↓
Observation
    ↓
Moderation
    ↓
Development Event / Update
```

---

## 5.3 Developer is not Reddit account

A developer is a person/team/project identity.

A Reddit username is an external identity attached to that developer.

Use:

```text
Developer
  ↓
Developer Identity
  ├── Reddit
  └── future sources
```

V1 only needs Reddit identities, but the schema must not hardcode Reddit into `developers`.

---

## 5.4 Development stage, lifecycle and activity are different concepts

Never collapse all three into one `status`.

### Stage

How far the port technically progressed.

```text
announced
research
early_wip
booting
in_game
playable
completable
released
unknown
```

### Lifecycle

Whether the project is being pursued.

```text
active
stalled
abandoned
archived
unknown
```

### Activity

Derived automatically from recent activity.

```text
hot
active
quiet
dormant
stale
```

Example:

```text
Stage:      Released
Lifecycle:  Active
Activity:   Hot
```

This is valid.

---

# 6. Working name and branding

Use:

```text
VitaPortWatch
```

Make the name centrally configurable:

```ts
export const SITE_NAME = "VitaPortWatch";
```

Do not tightly couple database names, CSS or route structures to the final product name.

Public disclaimer:

> Unofficial community project. Not affiliated with Sony Interactive Entertainment.

Do not use official Sony or PlayStation logos as VitaPortWatch branding.

---

# 7. Technology stack

Use a Cloudflare-first architecture.

## Runtime / hosting

```text
Cloudflare Workers
Cloudflare Workers Static Assets
Cloudflare D1
Cloudflare Cron Triggers
```

Do not use Cloudflare Pages for the new application.

Do not use Workers Sites.

Do not introduce Supabase, Firebase or another backend.

---

## Frontend

Use:

```text
React
TypeScript
Vite
Cloudflare Vite plugin
React Router
Tailwind CSS
Lucide
```

TanStack Query may be used if it materially simplifies remote-state handling.

Do not add it automatically if native fetch + route loaders remain simpler.

---

## Backend

Use:

```text
TypeScript
Hono
Zod
D1
```

No heavyweight ORM unless there is a demonstrated benefit.

Prefer explicit repository functions and versioned SQL migrations.

---

## Testing

Use:

```text
Vitest
React Testing Library
Playwright
```

---

# 8. No paid AI dependency

Runtime V1 must not depend on:

```text
OpenAI API
Claude API
Gemini API
paid classifier
embedding model
vector DB
```

Discovery classification uses:

```text
rules
aliases
keywords
known developers
context scoring
human moderation
```

The pipeline must later permit an AI observation extractor without architectural changes.

---

# 9. Recommended repository structure

Use approximately:

```text
/
├─ src/
│  ├─ web/
│  │  ├─ app/
│  │  ├─ routes/
│  │  ├─ components/
│  │  │  ├─ layout/
│  │  │  ├─ games/
│  │  │  ├─ projects/
│  │  │  ├─ developers/
│  │  │  ├─ updates/
│  │  │  ├─ timeline/
│  │  │  ├─ admin/
│  │  │  └─ ui/
│  │  ├─ hooks/
│  │  ├─ lib/
│  │  └─ styles/
│  │
│  ├─ worker/
│  │  ├─ index.ts
│  │  ├─ routes/
│  │  │  ├─ public/
│  │  │  └─ admin/
│  │  ├─ middleware/
│  │  ├─ repositories/
│  │  ├─ services/
│  │  │  ├─ discovery/
│  │  │  ├─ reddit/
│  │  │  ├─ matching/
│  │  │  ├─ moderation/
│  │  │  ├─ projects/
│  │  │  ├─ provenance/
│  │  │  └─ cleanup/
│  │  ├─ scheduled/
│  │  └─ security/
│  │
│  └─ shared/
│     ├─ types/
│     ├─ schemas/
│     ├─ constants/
│     └─ utils/
│
├─ migrations/
├─ scripts/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
│
├─ docs/
├─ public/
├─ wrangler.jsonc
├─ vite.config.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

Do not force this exact layout if a slightly different structure is materially cleaner.

Preserve clear boundaries.

---

# 10. Domain model

The authoritative domain graph should conceptually be:

```text
Game
 └── Port Project
      ├── Project Aliases
      ├── Developers
      │    └── Developer Identities
      ├── Technologies
      ├── Project Relationships
      ├── Stage History
      ├── Observations
      └── Updates
            └── Source Links

Source Item
 └── Observation
      └── Update
```

---

# 11. Database tables

Use at minimum:

```text
games

port_projects
project_aliases
project_relations
project_stage_history

developers
developer_identities
project_developers

technologies
project_technologies

source_items
observations

updates
update_sources

discovery_items

ingestion_cursors
ingestion_runs
failed_ingestion_items

admin_audit_log
```

Add supporting tables only when justified.

---

# 12. `games`

Represents original game identity.

Suggested fields:

```text
id
slug
title
normalized_title
original_release_year nullable
original_platform nullable
created_at
updated_at
```

Do not put Vita-port-specific state here.

`slug` unique.

---

# 13. `port_projects`

Represents a concrete Vita port implementation.

Suggested fields:

```text
id
game_id
slug
display_name nullable

current_stage
lifecycle

summary
playability_notes nullable
performance_notes nullable

first_seen_at
last_activity_at
released_at nullable

is_featured
is_archived

created_at
updated_at
```

`slug` unique.

The display name may normally equal the game title but must allow differentiation.

Example:

```text
Half-Life 2 — Barabbo port
Half-Life 2 — Experimental recomp
```

---

# 14. Project aliases

Create:

```text
project_aliases
```

Fields:

```text
id
port_project_id
alias
normalized_alias
match_strength
requires_context
created_at
```

Example:

```text
Half-Life 2
Half Life 2
HL2 Vita
HL2
Source Vita HL2
```

Very short aliases must default to:

```text
requires_context = true
```

Do not match a two-character acronym globally without contextual evidence.

---

# 15. Project stage history

Current state alone is insufficient.

Create:

```text
project_stage_history
```

Fields:

```text
id
port_project_id
stage
effective_at
source_update_id nullable
reason nullable
created_at
```

Example:

```text
2026-06-01 announced
2026-06-14 booting
2026-07-03 in_game
2026-08-19 playable
```

`port_projects.current_stage` is the current/cache value.

History is the authoritative timeline.

Status transitions should happen through a service function that updates both atomically.

---

# 16. Stage enum

Use:

```ts
type DevelopmentStage =
  | "announced"
  | "research"
  | "early_wip"
  | "booting"
  | "in_game"
  | "playable"
  | "completable"
  | "released"
  | "unknown";
```

Do not use `near_completion`.

That state is too subjective.

If a developer explicitly says a project is almost finished, preserve that as an observation/update rather than converting it to an objective system stage.

---

# 17. Lifecycle enum

Use:

```ts
type ProjectLifecycle =
  | "active"
  | "stalled"
  | "abandoned"
  | "archived"
  | "unknown";
```

Lifecycle changes also need history or audit provenance.

A released project may still have lifecycle `active`.

---

# 18. Derived activity

Activity is not manually authored.

Derive from `last_activity_at`.

Default thresholds:

```text
HOT       ≤ 7 days
ACTIVE    ≤ 30 days
QUIET     ≤ 90 days
DORMANT   ≤ 180 days
STALE     > 180 days
```

Make thresholds centrally configurable.

Do not imply `stale` means abandoned.

---

# 19. Developers

Create:

```text
developers
```

Fields:

```text
id
slug
display_name
description nullable
is_known_developer
created_at
updated_at
```

Do not store Reddit username directly here.

---

# 20. Developer identities

Create:

```text
developer_identities
```

Suggested fields:

```text
id
developer_id
provider
provider_user_id nullable
username
profile_url nullable
is_primary
valid_from nullable
valid_until nullable
created_at
updated_at
```

V1 provider:

```text
reddit
```

Future providers may exist without schema rewrite.

Username matching is case-insensitive.

Never assume identity solely from display-name similarity.

---

# 21. Project developers

Create:

```text
project_developers
```

Fields:

```text
port_project_id
developer_id
role
created_at
```

Roles:

```text
lead
contributor
engine
maintainer
unknown
```

Allow many-to-many relationships.

---

# 22. Technologies

Do not use one free-text `port_method` column as the entire technical model.

Create:

```text
technologies
project_technologies
```

Examples:

```text
Android SO Loader
Native Source Port
Decompilation
Static Recompilation
Dynamic Recompilation
vitaGL
Unity
Godot
Source Engine
Custom Engine
SDL
```

Store only technologies supported by evidence.

Do not infer technologies from game genre or platform.

---

# 23. Project relationships

Create:

```text
project_relations
```

Relationship types:

```text
depends_on
enables
fork_of
successor_of
related_to
```

Example:

```text
Vita Source runtime
    enables
Half-Life 2 port
```

Do not require relationships for normal project creation.

---

# 24. Source abstraction

External source ingestion must terminate at a normalized interface.

Use:

```ts
interface DiscoverySource {
  poll(input: PollInput): Promise<NormalizedSourceItem[]>;
  fetchItem(reference: SourceReference): Promise<NormalizedSourceItem | null>;
  normalizeUrl(url: string): Promise<SourceReference>;
}
```

V1 implementation:

```text
RedditDiscoverySource
```

The core application must not call Reddit APIs directly.

---

# 25. Normalized source item

Use approximately:

```ts
interface NormalizedSourceItem {
  source: "reddit";

  externalId: string;
  externalFullname?: string;

  canonicalUrl: string;
  type: "post" | "comment";

  authorExternalId?: string;
  authorUsername?: string;

  community?: string;

  createdAt: Date;
  editedAt?: Date;
  fetchedAt: Date;

  title?: string;
  body?: string;

  parentExternalId?: string;
  rootThreadExternalId?: string;

  contentHash: string;
}
```

Everything after normalization operates on this abstraction.

---

# 26. `source_items`

Persist source metadata separately.

Suggested fields:

```text
id
source_type
external_id
external_fullname nullable
item_type

canonical_url
community

author_external_id nullable
author_username nullable

parent_external_id nullable
root_thread_external_id nullable

source_created_at
source_edited_at nullable

content_hash nullable

first_seen_at
last_fetched_at

deleted_at nullable
raw_expires_at nullable

created_at
updated_at
```

Unique:

```text
(source_type, external_id)
```

This is essential for idempotency.

---

# 27. Temporary raw content

Reddit title/body/comment content must not become permanent application content.

If temporary raw content is stored for moderation:

```text
raw_title
raw_body
raw_expires_at
```

Default retention:

```text
maximum 48 hours
```

Purge expired raw content automatically.

Public VitaPortWatch summaries must be independently authored structured information.

Do not merely copy Reddit bodies into permanent summaries.

---

# 28. Observations

Create:

```text
observations
```

An observation is a structured claim extracted from evidence.

Fields may include:

```text
id
source_item_id
port_project_id nullable
developer_id nullable

observation_type
claim_text

suggested_stage nullable
suggested_lifecycle nullable

confidence
verification_level

moderation_status

created_at
reviewed_at nullable
```

Example:

Source comment:

```text
"Shaders finally work but FPS is still rough."
```

Observations:

```text
rendering milestone achieved
performance remains problematic
```

An observation is internal until approved.

---

# 29. Observation types

Examples:

```text
project_announced
technical_progress
first_boot
first_in_game
playability_progress
performance_progress
release
delay
stalled
resumed
abandoned
developer_statement
correction
other
```

Keep this list controlled and extensible.

---

# 30. Updates

Public VitaPortWatch development events live in:

```text
updates
```

Suggested fields:

```text
id
port_project_id
developer_id nullable

event_type
title
summary

event_at

verification_level

stage_before nullable
stage_after nullable

lifecycle_before nullable
lifecycle_after nullable

published
source_removed

created_at
updated_at
```

Never expose unmoderated observations as public updates.

---

# 31. Multiple sources per update

Create:

```text
update_sources
```

Fields:

```text
update_id
source_item_id
relationship
created_at
```

Relationship examples:

```text
primary
supporting
confirmation
```

One development event may have:

```text
Reddit post
+
developer reply
+
second confirmation
```

without generating duplicate public updates.

---

# 32. Verification

Use:

```ts
type VerificationLevel =
  | "developer_direct"
  | "maintainer_confirmed"
  | "community_report"
  | "unverified";
```

Meaning:

```text
developer_direct
Known linked developer identity made the statement.

maintainer_confirmed
Maintainer independently checked sufficient evidence.

community_report
Relevant community evidence exists but is not direct developer confirmation.

unverified
Evidence is incomplete or uncertain.
```

Do not represent these with official-looking account verification checkmarks.

---

# 33. Provenance rule

Every non-trivial factual development update must have provenance.

Public update page/card should allow:

```text
Source
Reddit · r/VitaPiracy
View original ↗
```

If multiple sources exist, expose them cleanly.

A user should always be able to understand why VitaPortWatch believes an event occurred.

---

# 34. Never generate fake progress percentages

VitaPortWatch must never calculate:

```text
Progress: 76%
```

from technical milestones.

If a developer explicitly reports a percentage:

```text
Developer-reported estimate: ~70%
```

Store it as an attributed observation with date and source.

Do not transform qualitative statements into numerical completion estimates.

---

# 35. Reddit API strategy

Use official Reddit Data API access with OAuth.

No anonymous JSON endpoint dependency.

No HTML scraping.

No Playwright/headless browsing for scheduled ingestion.

Secrets:

```text
REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET
REDDIT_USER_AGENT
```

Never expose secrets client-side.

---

# 36. Reddit client service

Implement a dedicated:

```text
RedditClient
```

Responsibilities:

```text
OAuth token acquisition
token expiry
request authorization
pagination
timeouts
rate-limit header parsing
retry/backoff
error normalization
safe logging
request budgeting
```

Do not scatter Reddit fetch calls around route handlers.

---

# 37. Reddit rate limits

Track:

```text
X-Ratelimit-Used
X-Ratelimit-Remaining
X-Ratelimit-Reset
```

Maintain a per-run request budget even when Reddit would technically permit more.

When budget becomes low:

```text
defer non-critical work
finish current high-priority work
record reason
continue next run
```

Never brute-force retry.

---

# 38. Retry policy

Retry only transient conditions:

```text
429
temporary 5xx
network timeout
connection reset
```

Use:

```text
bounded exponential backoff
jitter
maximum attempts
```

Do not retry:

```text
400
401 caused by bad credentials after refresh attempt
403 permanent permission issue
404 deleted resource
invalid URL
```

---

# 39. Polling architecture

Use Cron Trigger for discovery.

Initial schedule:

```text
*/15 * * * *
```

Every run:

```text
1. Start ingestion run
2. Read source cursors
3. Fetch bounded recent Reddit listings
4. Normalize source items
5. Deduplicate
6. Store/update source metadata
7. Score relevance
8. Match known projects/developers
9. Create discovery candidates
10. Inspect bounded tracked-thread comments
11. Inspect bounded known-developer activity
12. Advance cursors safely
13. Record metrics
14. Finish ingestion run
```

All steps must be idempotent.

---

# 40. Cron overlap safety

Assume scheduled jobs may overlap.

Correctness must not depend on only one execution occurring.

Use:

```text
database uniqueness constraints
upserts
idempotency keys
cursor compare/update rules
run IDs
```

Do not solve basic correctness with an unnecessary distributed lock.

Only add locking if evidence shows it is required.

---

# 41. Ingestion cursors

Create:

```text
ingestion_cursors
```

Suggested fields:

```text
id
source_type
feed_key
last_external_id nullable
last_seen_timestamp nullable
last_successful_poll nullable
last_attempt_at nullable
next_priority_at nullable
metadata_json nullable
```

Examples:

```text
reddit:subreddit:VitaPiracy
reddit:subreddit:vitahacks
reddit:thread:t3_abc123
reddit:developer:u_somebody
```

---

# 42. Ingestion runs

Create:

```text
ingestion_runs
```

Fields:

```text
id
source_type
run_type

started_at
finished_at nullable

status

requests_used
items_fetched
items_new
items_updated
items_relevant
items_queued
items_skipped
items_failed

rate_limit_remaining nullable

error_summary nullable

created_at
```

Statuses:

```text
running
success
partial
failed
```

This becomes the operational source of truth.

---

# 43. Admin ingestion health

Admin dashboard should show:

```text
Reddit ingestion

Last successful run    12:15
Duration               1.8 s
API requests           7
Fetched                42
New                    6
Candidates             3
Errors                 0
Rate limit             Healthy
```

Do not require Cloudflare logs to understand basic ingestion health.

---

# 44. Failed ingestion items

Create:

```text
failed_ingestion_items
```

Fields:

```text
id
source_type
external_id nullable
canonical_url nullable

failure_stage
error_code
error_message

attempt_count
first_failed_at
last_failed_at
next_retry_at nullable

status
```

Statuses:

```text
retryable
ignored
resolved
permanent
```

Admin actions:

```text
Retry
Ignore
Inspect
```

Never enter an infinite retry loop.

---

# 45. Request budgets

Make request budgets configurable.

Example:

```text
MAX_REDDIT_REQUESTS_PER_RUN
MAX_SUBREDDIT_PAGES_PER_RUN
MAX_TRACKED_THREADS_PER_RUN
MAX_DEVELOPER_CHECKS_PER_RUN
```

Do not let project growth linearly explode Reddit API usage.

---

# 46. Priority scheduling

Tracked activity should be prioritized.

Example priority:

```text
1. Main subreddit listings
2. Hot/active project threads
3. Known active developers
4. Quiet projects
5. Dormant projects
```

Use round-robin cursoring for lower-priority feeds.

Do not poll every tracked thread every 15 minutes forever.

---

# 47. Thread comment monitoring

Comments are first-class evidence.

Monitor comments for:

```text
tracked project threads
recently relevant discovery threads
developer-authored project threads
```

Do not recursively crawl all comments in all monitored subreddits.

Comments from known project developers should receive higher relevance weight.

---

# 48. Developer watchlist

Known developers can have Reddit identities marked for monitoring.

Polling their activity should remain bounded.

Relevant developer activity requires at least one of:

```text
known project alias
Vita development context
tracked thread context
porting terminology
manual watch context
```

A developer discussing unrelated topics must not create candidates.

---

# 49. Manual Reddit ingestion

Admin route:

```text
/admin/ingest
```

Allow a Reddit URL to be pasted.

Workflow:

```text
validate URL
↓
canonicalize
↓
resolve Reddit ID
↓
fetch through official API
↓
normalize
↓
deduplicate
↓
score
↓
match
↓
open candidate in moderation
```

Do not automatically publish.

---

# 50. Reddit URL security

Allow only explicitly supported Reddit hosts.

For example:

```text
reddit.com
www.reddit.com
old.reddit.com
redd.it
```

Canonicalize URLs before use.

Never perform arbitrary server-side fetches based on user-controlled URLs.

Protect against SSRF.

---

# 51. Content change detection

Calculate a normalized content hash.

Recommended:

```text
SHA-256(normalized relevant source content)
```

On refetch:

```text
same hash
→ no material content change

different hash
→ mark source changed
→ reconsider candidate if relevant
```

Do not keep indefinite raw historical copies merely for diffing.

---

# 52. Reddit deletion compliance

At minimum once daily, run source reconciliation.

Recommended cron:

```text
17 3 * * *
```

Cron is UTC.

Tasks:

```text
purge expired raw content
re-check relevant recent source items
detect deleted posts/comments
detect removed author identity where applicable
purge deleted Reddit-derived content
mark source records appropriately
repair public provenance state
clean old ignored discoveries
```

---

# 53. Deleted source behavior

When Reddit content is deleted:

```text
raw title/body      → delete
embedded URLs       → delete if derived from deleted source
author identifiers  → delete where required
content hash        → remove if policy requires
source state        → mark deleted
```

Public event handling must be conservative.

If a VitaPortWatch update has other valid evidence:

```text
keep event
remove deleted source
```

If its only evidence disappears:

```text
mark source_removed
hide/update event according to moderation policy
```

Do not preserve deleted Reddit content in disguised form.

---

# 54. Backfill

Provide a bounded backfill tool.

Example:

```bash
npm run reddit:backfill -- --days=30
```

Optionally:

```bash
--subreddit VitaPiracy
--max-items 500
```

Backfill must reuse the exact same normalization, deduplication and discovery pipeline as cron.

No parallel second implementation.

Hard-cap requests and items.

---

# 55. Discovery scoring

Use an explainable rule-based relevance system.

Positive signal examples:

```text
PS Vita
Vita
port
porting
ported
WIP
work in progress
progress
development
vitaGL
recomp
decomp
source port
SO loader
VPK
FPS
performance
build
release
playable
booting
in-game
```

Context matters more than raw keyword presence.

---

# 56. Strong relevance signals

Suggested scoring:

```text
+6 known developer + matched tracked project
+5 exact project alias
+5 direct developer statement
+4 Vita + port/development combination
+3 WIP/progress terminology
+3 tracked thread context
+2 technical porting terminology
+2 linked repository/source-code context
+1 FPS/performance/build terminology
```

Negative:

```text
-6 buying/selling
-6 generic install support
-5 piracy/download-only question
-5 unrelated emulation discussion
-4 Vita hardware troubleshooting
-4 jailbreak support
```

Keep actual weights in config, not scattered code.

---

# 57. Explainable matching

Every discovery item must contain reasons.

Example:

```json
[
  "known_developer",
  "project_alias:half-life-2",
  "keyword:progress",
  "context:tracked_thread"
]
```

Admin must be able to understand why something appeared.

Do not expose opaque numerical scores without explanation.

---

# 58. Project matching

Normalize candidate/project strings:

```text
lowercase
Unicode normalization
punctuation normalization
whitespace collapse
safe article handling if useful
```

Project aliases are the main matching mechanism.

For aliases shorter than 4 characters:

```text
require additional context
```

Never make loose fuzzy matching authoritative.

Fuzzy similarity may suggest a match, never auto-confirm it.

---

# 59. Developer matching

Match linked Reddit identities exactly/case-insensitively.

Do not merge developers because usernames look similar.

Unknown Reddit users remain source authors until manually linked.

---

# 60. Discovery candidate

Use a normalized internal shape similar to:

```ts
interface DiscoveryCandidate {
  sourceItemId: string;

  source: "reddit";

  matchedProjects: ProjectMatch[];
  matchedDevelopers: DeveloperMatch[];

  suggestedObservationTypes: ObservationType[];

  suggestedStage?: DevelopmentStage;
  suggestedLifecycle?: ProjectLifecycle;

  score: number;
  reasons: string[];

  needsReview: true;
}
```

---

# 61. Discovery queue

Route:

```text
/admin/discovery
```

This is one of the highest-priority product surfaces.

Each candidate displays:

```text
source type
subreddit
author
date
temporary preview
original Reddit link
relevance score
matching reasons
matched project(s)
matched developer
possible observation type
possible stage/lifecycle transition
```

Actions:

```text
Approve
Edit then approve
Attach to project
Create new game + project
Create new port project under existing game
Link developer
Split into multiple observations
Merge with existing update
Mark duplicate
Ignore
Reject
```

---

# 62. Split discovery

One Reddit source may mention multiple project developments.

Admin must be able to convert:

```text
1 source
```

into:

```text
Observation A → Project A
Observation B → Project B
```

Do not force one source item to map to exactly one project.

---

# 63. Merge duplicate updates

Multiple Reddit posts can describe the same real-world event.

Admin must be able to:

```text
attach additional source to existing update
```

rather than creating duplicate timeline events.

---

# 64. Project merge

Mandatory MVP admin functionality.

If duplicate projects exist:

```text
/admin/projects/:id/merge
```

Merge should reassign safely:

```text
aliases
developers
technologies
relations
stage history
observations
updates
source relations
discovery references
```

The losing record becomes archived/tombstoned.

Do not silently delete audit history.

---

# 65. Developer merge

Also support merging duplicate developer entities.

Preserve:

```text
identities
project relationships
update attribution
audit history
```

---

# 66. Undo / revert

Moderation errors should not require manual SQL.

Support at least:

```text
Revert approved update
Revert stage change
Restore ignored discovery
Undo recent merge where safely possible
```

Use explicit audit records and reversible operations.

For destructive merges, generate a merge plan before commit.

---

# 67. Admin audit log

Create:

```text
admin_audit_log
```

Fields:

```text
id
action
entity_type
entity_id

before_json nullable
after_json nullable
metadata_json nullable

created_at
```

Do not store secrets or raw Reddit bodies unnecessarily.

---

# 68. Concurrency-safe moderation

Admin writes must use optimistic safety where relevant.

For edited entities include:

```text
updated_at
```

Reject or warn on stale write conflicts rather than silently overwriting newer work.

This matters even with one maintainer because multiple browser tabs exist.

---

# 69. Public navigation

Use:

```text
Home
Projects
Developers
Updates
About
```

Global search should remain easy to access.

No prominent admin link is required.

---

# 70. Homepage concept

Do NOT build a standard SaaS dashboard landing page.

No giant marketing hero.

No four-card KPI row.

No "future of gaming" copy.

Homepage structure:

```text
VITAPORTWATCH

Track PS Vita port development.

[ Search ports or developers... ]

Latest development
──────────────────────────────

Half-Life 2        IN-GAME
Shader milestone
2h ago

Twilight Princess PLAYABLE
Performance update
8h ago


Active development
──────────────────────────────

[project cards]


Recently active developers
──────────────────────────────


Newly discovered
──────────────────────────────


Recently released
──────────────────────────────
```

Data first.

Branding second.

---

# 71. Homepage summary metrics

Metrics may appear subtly, not as giant dashboard boxes.

Example:

```text
18 active projects · 7 updated this week · 12 developers
```

All metrics must come from real database queries.

No fake numbers.

---

# 72. Projects index

Route:

```text
/projects
```

Provide:

```text
search
stage filter
lifecycle filter
activity filter
developer filter
technology filter
sort
```

Sort:

```text
Recently updated
Newest discovered
Most updates this month
Alphabetical
```

Do not use "Trending" unless a precise public definition exists.

---

# 73. Project card

Information hierarchy:

```text
STAGE              ACTIVITY

Game title
Port differentiator if needed

Developer A · Developer B
Technology / method

Updated 2 days ago
3 updates this month
```

Do not show every known metadata field.

---

# 74. Project detail page

Route:

```text
/projects/:slug
```

Header:

```text
game
project name if distinct
stage
lifecycle
activity
developers
last activity
first seen
```

Sections:

```text
Overview
Development Timeline
Technical Details
Developers
Sources / Evidence
Related Projects
```

---

# 75. Development progression UI

Show actual stage history.

Example:

```text
● Announced       Jun 1
│
● Booting         Jun 14
│
● In-game         Jul 3
│
● Playable        Aug 19
```

Do not show unachieved future stages as if they were roadmap commitments.

---

# 76. Timeline

Timeline is the core public visualization.

Each event should show:

```text
date
event type
title
summary
developer attribution
verification
stage/lifecycle transition if applicable
source links
```

Newest first by default.

Optionally permit chronological order.

---

# 77. Technical details

Show only documented data.

Possible fields:

```text
Original platform
Technologies
Engine
Port approach
Playability
Performance notes
```

Hide empty/unknown sections when that produces a cleaner interface.

Never invent completeness.

---

# 78. Developers index

Route:

```text
/developers
```

Default sort:

```text
Recently active
```

Developer card:

```text
Display name
Reddit identity
Active projects
Released projects
Last activity
```

---

# 79. Developer detail

Route:

```text
/developers/:slug
```

Show:

```text
display name
linked Reddit identity
description
projects
recent development activity
```

Project groups:

```text
Active
Released
Stalled / archived
```

Do not turn it into a social profile.

---

# 80. Updates feed

Route:

```text
/updates
```

Filters:

```text
project
developer
event type
verification
date range
```

Each entry links to:

```text
project
developer if applicable
original evidence
```

---

# 81. Search

Global search over:

```text
game title
port project display name
project aliases
developer names
developer Reddit usernames
technologies
```

D1 SQL is sufficient for V1.

Do not add Algolia/Elastic/search SaaS.

Debounce frontend input.

Use indexed normalized fields.

---

# 82. "Since your last visit"

Implement a privacy-friendly convenience feature.

Store locally in browser:

```text
last viewed timestamp per project
```

On return:

```text
3 updates since your last visit
```

No account.

No server tracking.

No fingerprinting.

Provide graceful fallback when localStorage unavailable.

---

# 83. Public API

Provide a small read-only API:

```text
GET /api/projects
GET /api/projects/:slug
GET /api/games/:slug
GET /api/developers
GET /api/developers/:slug
GET /api/updates
GET /api/stats
```

Standard response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0
  }
}
```

Hard maximum page size:

```text
100
```

---

# 84. Admin API

Protected endpoints for:

```text
games
port projects
developers
identities
technologies
observations
updates
discoveries
manual Reddit ingestion
merge/revert operations
ingestion operations
```

All writes require Zod validation server-side.

---

# 85. Admin authentication

Protect:

```text
/admin/*
/api/admin/*
```

with Cloudflare Access where possible.

Backend must verify the relevant authenticated assertion.

Do not rely solely on frontend hiding.

Local development may support:

```text
DEV_ADMIN_BYPASS=true
```

only in development.

Production startup/deployment must fail if this bypass is enabled.

No hardcoded password.

---

# 86. Security headers

Configure appropriate production headers.

At minimum evaluate:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
frame protection
HSTS when appropriate
```

Use a restrictive CSP compatible with the final build.

Do not add `'unsafe-inline'` casually.

---

# 87. API security

Protect against:

```text
SQL injection
XSS
CSRF on admin writes
SSRF
open redirect
malformed URLs
unbounded queries
oversized payloads
unsafe external HTML
```

Never render Reddit Markdown as trusted HTML.

External links:

```html
rel="noopener noreferrer"
```

---

# 88. UI visual direction

Hard requirement:

> A premium modern handheld development tracker inspired by PS Vita hardware personality and interface philosophy, without copying Sony's UI.

The site must feel:

```text
dark
precise
compact
premium
information-first
Vita-adjacent
technical
modern
calm
```

Not:

```text
AI generated
generic SaaS
cyberpunk
retro forum
gamer-template
web3
```

---

# 89. Anti-AI-slop rules

Do not use:

```text
purple/pink blobs
floating 3D spheres
random decorative glass cards
huge empty hero section
neon overload
glitch effects
matrix code
giant gradient buttons
excessive glassmorphism
generic feature-grid landing page
fake testimonials
fake user avatars
stock gamer artwork
random PlayStation symbols
gratuitous carousels
huge meaningless statistics
```

Do not install a fully themed component library such as:

```text
shadcn default styling
DaisyUI
Flowbite
```

Headless accessibility utilities are acceptable where justified.

---

# 90. Design tokens

Starting direction:

```css
--bg: #090c11;
--surface-1: #0f141b;
--surface-2: #151b24;
--surface-3: #1b2330;

--border: #202a38;

--text-primary: #edf5ff;
--text-secondary: #9aaabd;
--text-muted: #68788c;

--accent: #249cf4;
--accent-hover: #4fb5ff;
--accent-soft: rgba(36, 156, 244, 0.12);
```

Semantic colors should be muted and cohesive.

Do not let status colors dominate entire cards.

---

# 91. Typography

Use one main family:

```text
Geist
or
Inter
```

Optional metadata mono font:

```text
JetBrains Mono
```

Maximum two font families.

No sci-fi display fonts.

No imitation PlayStation font.

---

# 92. PS Vita influence

Express Vita identity through:

```text
rounded but precise geometry
OLED-like dark surfaces
cool blue illumination
compact information density
subtle bubble/pill motifs
screen-like panels
careful transitions
handheld-scale proportions
```

Do not recreate LiveArea literally.

---

# 93. Motion

Use subtle motion only.

Examples:

```text
small hover translation
border illumination
filter transitions
timeline reveal
new activity indicator
```

Respect:

```text
prefers-reduced-motion
```

No full-screen animated backgrounds.

---

# 94. Responsive targets

Validate explicitly at:

```text
360×800
390×844
768×1024
1280×800
1440×900
1920×1080
```

No horizontal overflow.

Maintain comfortable information density.

---

# 95. Accessibility

Minimum:

```text
semantic HTML
keyboard navigation
visible focus states
WCAG AA contrast
proper form labels
accessible dialog behavior
reduced motion support
status conveyed by text + color
```

Run an accessibility review before completion.

---

# 96. Images

Artwork is optional.

The UI must remain excellent with no project image.

V1 may support:

```text
manually supplied project image
local initials/typographic project treatment
```

Do not automatically download Reddit media into permanent storage.

Do not depend on an external artwork API.

---

# 97. Empty states

A production database may initially be nearly empty.

The UI must still look intentional.

Examples:

```text
No active projects match these filters.

Clear filters
```

Admin:

```text
Discovery queue is clear.

No Reddit development candidates need review.
```

No generic AI illustrations.

---

# 98. Loading

Use layout-aware skeletons.

Avoid global spinners for normal page transitions.

---

# 99. Error handling

Distinguish:

```text
not found
network failure
Reddit unavailable
D1 unavailable
rate limited
unauthorized
validation error
source deleted
```

Public messages stay simple.

Admin may show useful operational detail without leaking secrets.

---

# 100. D1 free-tier discipline

Design queries with the free tier in mind.

Avoid:

```text
frequent full table scans
N+1 queries
huge unbounded timelines
unindexed filter columns
excessive write amplification
```

Measure D1 metadata where useful.

Admin operational view should eventually expose approximate row usage if practical.

---

# 101. Database indexes

At minimum consider indexes for:

```text
games.slug
games.normalized_title

port_projects.slug
port_projects.game_id
port_projects.current_stage
port_projects.lifecycle
port_projects.last_activity_at

project_aliases.normalized_alias

developers.slug

developer_identities.provider
developer_identities.username

project_developers.port_project_id
project_developers.developer_id

project_stage_history.port_project_id
project_stage_history.effective_at

source_items.source_type + external_id
source_items.root_thread_external_id
source_items.last_fetched_at
source_items.raw_expires_at

observations.moderation_status
observations.port_project_id

updates.port_project_id
updates.event_at
updates.developer_id

discovery_items.moderation_status
discovery_items.detected_at

ingestion_cursors.feed_key
ingestion_runs.started_at
```

Do not blindly index every field.

Review actual query patterns.

---

# 102. Pagination

All list endpoints must be bounded.

Use stable sorting.

Prefer cursor pagination where it materially improves timeline/feed stability.

Page-number pagination is acceptable for small admin lists.

Never return every update/project by default.

---

# 103. Caching

Cache safe public GET responses briefly.

Examples:

```text
project list       60 seconds
project detail     60 seconds
developers         60 seconds
stats              60 seconds
```

Do not cache admin writes.

Avoid complex manual invalidation unless needed.

Short TTL is acceptable for V1.

---

# 104. No external analytics in V1

Do not add:

```text
Google Analytics
Meta Pixel
advertising SDK
fingerprinting
session replay
```

Cloudflare operational analytics are sufficient initially.

---

# 105. Staging environments

Support:

```text
local
staging
production
```

Use separate D1 databases.

Staging scheduled Reddit ingestion should be **disabled by default**.

Never let staging unknowingly double-poll production Reddit feeds.

---

# 106. Environment validation

Required production configuration should be validated.

Missing Reddit credentials:

```text
public tracker remains operational
scheduled Reddit ingestion enters degraded state
admin dashboard displays clear warning
```

Do not crash the whole public website.

---

# 107. Graceful degradation

If Reddit fails:

```text
existing data remains browsable
public API keeps working
admin indicates ingestion degradation
cron records failure
no existing project data is deleted
later scheduled run retries
```

External source availability must not affect database reads.

---

# 108. Seed data

Development-only seed data must be obviously fictional.

Example:

```text
Example Game
Example Vita Port
Example Developer
```

Production starts without fabricated real projects.

Do not create fake facts about real games for demonstration.

---

# 109. CI

Set up CI for every push / pull request.

Run:

```text
lint
typecheck
unit tests
integration tests
build
```

Run critical Playwright tests in CI where practical.

Production deploy must not proceed after failed validation.

---

# 110. Visual regression

Create Playwright screenshot coverage for key surfaces:

```text
homepage desktop
homepage mobile
projects
project detail
developer detail
updates
admin discovery
```

Use these as regression references.

This is especially important during future agent-driven UI changes.

---

# 111. Unit tests

Must cover at minimum:

```text
string normalization
alias matching
short-alias safety
developer identity matching
activity derivation
stage transitions
lifecycle transitions
relevance scoring
content hashing
URL canonicalization
Reddit response normalization
rate-limit interpretation
request budgeting
```

---

# 112. Integration tests

Must cover:

```text
D1 repositories
unique source deduplication
same Reddit item processed twice
observation approval
update creation
stage history transaction
source linking
source deletion reconciliation
project merge
developer merge
audit logging
revert operation
cursor advancement
failed-ingestion handling
```

---

# 113. E2E tests

At minimum:

```text
homepage
project search/filter
project detail timeline
developer detail
updates feed
manual Reddit URL ingestion
discovery approval
new project creation from discovery
duplicate project merge
revert update
admin unauthorized behavior
mobile navigation
404
```

---

# 114. Architecture documentation

Create:

```text
docs/MASTER_BLUEPRINT.md
docs/IMPLEMENTATION_PLAN.md
docs/REQUIREMENTS_MATRIX.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/REDDIT_INGESTION.md
docs/MODERATION.md
docs/SECURITY.md
docs/DEPLOYMENT.md
docs/DECISIONS.md
docs/KNOWN_ISSUES.md
```

Copy this blueprint into:

```text
docs/MASTER_BLUEPRINT.md
```

and treat it as immutable product intent unless deliberately revised.

---

# 115. Requirements matrix

Codex must maintain:

```text
docs/REQUIREMENTS_MATRIX.md
```

Format:

```text
Requirement                         Status      Evidence
----------------------------------------------------------------
Game / Port separation              DONE        migrations/...
Stage history                       DONE        ...
Reddit OAuth                        DONE        ...
Comment discovery                   DONE        ...
Project merge                       TODO
Deletion reconciliation             DONE        ...
Mobile 360px QA                     TODO
```

Allowed statuses:

```text
TODO
IN_PROGRESS
BLOCKED
DONE
VERIFIED
```

`DONE` is not enough for final delivery.

Critical items must become:

```text
VERIFIED
```

after testing or inspection.

---

# 116. Architecture decision log

Maintain:

```text
docs/DECISIONS.md
```

For non-trivial choices record:

```text
Decision
Reason
Alternatives considered
Consequences
Date
```

Do not document trivial coding decisions.

---

# 117. Implementation workflow for Codex

At the beginning:

```text
1. Inspect repository
2. Read MASTER_BLUEPRINT
3. Identify existing useful code
4. Identify conflicts
5. Create IMPLEMENTATION_PLAN
6. Create REQUIREMENTS_MATRIX
7. Begin implementation
```

Do not rewrite functional existing work merely to match preferred style.

---

# 118. Mandatory phase gates

Execute in phases.

## Phase 1 — Foundation

Implement:

```text
Cloudflare Worker
Static Assets
React/Vite
Hono
D1 binding
migrations
shared types
base design tokens
environment handling
```

Gate:

```text
lint
typecheck
build
```

---

## Phase 2 — Domain foundation

Implement:

```text
games
port projects
aliases
developers
identities
project relationships
technologies
stage history
repositories
```

Gate:

```text
domain unit tests
D1 integration tests
```

---

## Phase 3 — Evidence model

Implement:

```text
source_items
observations
updates
update_sources
verification
provenance
audit log
```

Gate:

```text
source → observation → update integration test
```

---

## Phase 4 — Public UI

Implement:

```text
homepage
projects
project detail
developers
developer detail
updates
search
filters
responsive layout
```

Gate:

```text
Playwright public flows
responsive screenshots
```

---

## Phase 5 — Reddit adapter

Implement:

```text
OAuth
RedditClient
normalization
URL parsing
rate limits
request budgets
content hashing
subreddit polling
```

Gate:

```text
mocked API tests
manual source fetch test
```

---

## Phase 6 — Discovery engine

Implement:

```text
relevance rules
project matching
developer matching
discovery queue
tracked thread logic
developer monitoring
```

Gate:

```text
false-positive-focused unit tests
duplicate ingestion test
```

---

## Phase 7 — Moderation

Implement:

```text
candidate review
approve/edit
split observations
create project
attach project
link developer
merge sources
ignore/reject
```

Gate:

```text
full E2E moderation path
```

---

## Phase 8 — Operations

Implement:

```text
cursors
ingestion runs
failed item queue
scheduled polling
maintenance cron
deletion reconciliation
temporary-data purge
bounded backfill
```

Gate:

```text
cron simulation
idempotency test
failure/recovery test
```

---

## Phase 9 — Data repair tools

Implement:

```text
project merge
developer merge
revert update
revert stage change
restore discovery
audit inspection
```

Gate:

```text
merge integrity tests
revert tests
foreign-key integrity
```

---

## Phase 10 — Hardening

Implement/review:

```text
Cloudflare Access
security headers
CSP
SSRF prevention
XSS safety
request size limits
CORS
admin origin checks
secret handling
```

Gate:

```text
security review
```

---

## Phase 11 — Polish

Complete:

```text
loading states
empty states
error states
keyboard navigation
reduced motion
SEO
metadata
performance
mobile QA
visual regression
```

---

## Phase 12 — Final audit

Re-read:

```text
MASTER_BLUEPRINT.md
REQUIREMENTS_MATRIX.md
```

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Fix failures.

Do not merely report them.

---

# 119. Required npm scripts

Provide a coherent set such as:

```json
{
  "dev": "...",
  "build": "...",
  "preview": "...",

  "lint": "...",
  "typecheck": "...",

  "test": "...",
  "test:unit": "...",
  "test:integration": "...",
  "test:e2e": "...",

  "db:migrate:local": "...",
  "db:migrate:remote": "...",

  "seed:dev": "...",

  "reddit:backfill": "...",

  "deploy:staging": "...",
  "deploy": "..."
}
```

Exact implementation may follow current Cloudflare tooling.

---

# 120. README requirements

README must allow a developer to go from clone to local application.

Include:

```text
project overview
architecture summary
requirements
installation
local environment
D1 setup
local migrations
dev seed
Reddit API configuration
Cloudflare configuration
Cloudflare Access
testing
backfill
Cron Triggers
staging
production deployment
troubleshooting
```

Do not leave deployment knowledge only in source code.

---

# 121. Deployment documentation

`docs/DEPLOYMENT.md` must explicitly document:

```text
Cloudflare project creation
D1 creation
bindings
migrations
Worker secrets
Reddit credentials
Static Assets
Cron Triggers
staging configuration
Cloudflare Access
deploy
rollback strategy
```

Do not assume prior Cloudflare expertise.

---

# 122. Data backup / recovery

Document D1 recovery procedures available under the selected plan.

Before risky manual migrations or bulk merge operations:

```text
document restore strategy
```

Project merge actions should never be performed without transactional or recoverable design.

---

# 123. Database migration discipline

Never modify an already-applied production migration.

Use:

```text
0001_initial.sql
0002_source_model.sql
0003_indexes.sql
...
```

Migrations must be deterministic.

Schema changes require corresponding repository/type updates.

---

# 124. Production observability

Without introducing paid monitoring, admin should reveal:

```text
last ingestion success
last ingestion failure
recent run metrics
failed items
queue depth
oldest pending discovery
last maintenance run
raw content pending deletion
```

Operational problems should be visible from the application.

---

# 125. Health endpoint

Implement a safe health endpoint.

Example:

```text
GET /api/health
```

Return only:

```text
app status
database reachable
Reddit ingestion configured yes/no
last ingestion success timestamp
```

Do not expose secrets, internal stack traces or sensitive infrastructure details.

---

# 126. Content language

Public VitaPortWatch UI should default to **English** because the Vita development community is international.

Do not build localization in V1.

Keep user-facing copy centralized enough that localization remains possible later.

---

# 127. Public copy style

Good:

```text
Track PS Vita port development.

Latest development

Updated 3 hours ago

Developer statement

Recently resumed
```

Bad:

```text
The ultimate revolutionary Vita ecosystem.

Discover the future of handheld gaming.

Powering the next generation of creators.
```

No generic marketing copy.

---

# 128. Moderation language

Use factual wording.

Prefer:

```text
Developer reports improved rendering performance.
```

over:

```text
Huge breakthrough brings the port closer than ever!
```

VitaPortWatch is a tracker, not hype journalism.

---

# 129. Date handling

Store timestamps in UTC.

Display user-local dates where appropriate.

For timeline events include absolute dates.

Relative time:

```text
3 hours ago
```

may accompany:

```text
15 Sep 2026 · 10:13
```

Never use relative time as the only historical representation.

---

# 130. No silent inference

Do not infer:

```text
project abandoned because 180 days passed
developer identity because names are similar
stage playable because video exists
release because someone claims download exists
completion percentage
engine based only on game
```

Activity may become stale automatically.

Lifecycle and stage require evidence or moderator decision.

---

# 131. Project creation workflow

Admin project creation should distinguish:

```text
Create new game
Create new port project for existing game
```

This prevents duplicate game identities.

Search existing games before creating a new one.

---

# 132. Duplicate suggestions

When creating a game/project, show possible existing matches.

Example:

```text
Possible existing entries:

Half-Life 2
Half Life 2: Episode One
HL2 Experimental Vita Port
```

Do not block creation solely from fuzzy similarity.

Let admin decide.

---

# 133. Safe deletes

Prefer archive/soft-delete for domain entities.

Hard deletion should be reserved for:

```text
temporary raw Reddit data
compliance deletion
clearly invalid internal records with no dependencies
```

Merges should tombstone losing records.

---

# 134. Search-engine behavior

Implement:

```text
title metadata
description metadata
canonical URLs
robots.txt
sitemap
semantic headings
OpenGraph defaults
```

Do not spend major V1 effort on dynamic image-generation infrastructure.

Dynamic OG images can remain roadmap unless trivial.

---

# 135. Accessibility QA

Before final completion:

```text
keyboard-only navigation
visible focus
screen-reader labels
dialog focus trapping
contrast
reduced motion
mobile touch targets
```

Do not claim accessibility because components use semantic HTML alone.

---

# 136. Performance QA

Avoid:

```text
large JS dependencies
full timeline loaded upfront
unoptimized giant images
animation libraries for basic fades
unbounded API requests
```

Lazy-load admin area.

Paginate timeline where needed.

Public app should remain fast on older mobile hardware.

---

# 137. Future-source readiness

The core system should eventually permit:

```text
Reddit
GitHub
Discord
RSS
manual source
```

to produce the same normalized source/observation model.

But only Reddit is implemented now.

Do not build unused adapters.

---

# 138. Future AI readiness

Future AI may perform:

```text
relevance classification
observation extraction
project match suggestions
summary drafting
duplicate-event suggestions
```

AI must never become authoritative.

Future flow:

```text
Source
  ↓
AI suggestion
  ↓
Observation candidate
  ↓
Human review
  ↓
Public update
```

The V1 schema must support this without migration-heavy redesign.

---

# 139. Explicit roadmap, not V1

Document but do not build:

```text
GitHub source adapter
Discord source adapter
public submissions
developer claim/verification
subscriptions
notifications
weekly digest
AI-assisted moderation
dynamic social cards
public API tokens
historical activity analytics
community contributor roles
```

---

# 140. Definition of Done

The project is complete only when all critical requirements are **VERIFIED**, including:

```text
Game and Port Project are separate entities.

Multiple port projects can exist for one game.

Developer identity is separated from developer entity.

Stage, lifecycle and activity are separate.

Stage history is preserved.

Reddit source items are separate from observations.

Observations are separate from public updates.

Updates support multiple sources.

Reddit ingestion uses OAuth.

Reddit ingestion is idempotent.

Subreddit polling works.

Tracked-thread comment monitoring works.

Known-developer monitoring works.

Manual Reddit URL ingestion works.

Request budgets exist.

Ingestion cursors exist.

Ingestion run telemetry exists.

Failed ingestion handling exists.

Temporary Reddit content expires.

Deletion reconciliation exists.

Discovery requires human moderation.

Project merging works.

Developer merging works.

Important moderation actions can be reverted.

Audit history exists.

Public project timeline works.

Developer pages work.

Search and filtering work.

Admin routes are protected.

Production bypass is impossible.

Responsive UI is verified.

Accessibility is reviewed.

Security review is completed.

No production fake data exists.

All tests pass.

Production build passes.

Deployment documentation is complete.
```

---

# 141. Final Codex operating instruction

Do not treat this as a prompt to generate a prototype.

Treat it as a software specification.

Start by inspecting the current repository.

Then:

```text
1. Copy this specification into docs/MASTER_BLUEPRINT.md
2. Build IMPLEMENTATION_PLAN.md
3. Build REQUIREMENTS_MATRIX.md
4. Implement phase by phase
5. Test each phase
6. Update evidence in REQUIREMENTS_MATRIX.md
7. Re-read MASTER_BLUEPRINT.md after every major phase
8. Fix failures before proceeding
9. Perform final security/data/UI audit
10. Deliver only after critical requirements are VERIFIED
```

If an external credential is unavailable:

```text
implement the entire surrounding integration
mock/test the external boundary
document exactly which secret is missing
degrade gracefully
continue all other work
```

Do not stop simply because Reddit credentials are unavailable.

Do not ask unnecessary architecture questions when this blueprint already answers them.

If an unspecified technical decision is required:

```text
choose the simplest production-quality solution
preserve zero-cost-first architecture
avoid new vendors
avoid scope creep
document consequential decisions
continue
```

---

# 142. Final quality bar

The finished application should not feel like:

```text
a hackathon project
an AI-generated dashboard
a generic Tailwind template
a collection of Reddit links
```

It should feel like:

> a purpose-built, carefully maintained development tracker for the modern PS Vita porting scene.

Its strongest qualities should be:

```text
clear development history
trustworthy provenance
fast moderation
excellent project/developer discovery
strong visual identity
low maintenance cost
architecture that can grow without a rewrite
```

That is the product.