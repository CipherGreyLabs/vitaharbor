# VitaHarbor

> Production-quality, zero-cost-first development tracker for active PS Vita game ports.
> Unofficial community project. Not affiliated with Sony Interactive Entertainment.

---

## 1. Project Overview

VitaHarbor answers one primary question:
**What PS Vita game ports are currently being developed, by whom, how far have they progressed, and what changed recently?**

The system operates as a structured development intelligence tracker that ingests public Reddit signals (r/VitaPiracy, r/vitahacks), parses observations into a verified evidence model, and displays project progression with strict provenance.

---

## 2. Architecture Summary

- **Runtime & Hosting**: Cloudflare Workers + Workers Static Assets
- **Database**: Cloudflare D1 (Serverless SQLite)
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v7
- **Backend API**: Hono framework on Cloudflare Workers
- **Ingestion**: Reddit API via OAuth2, normalized into Source Items -> Observations -> Verified Updates
- **Scheduling**: Cloudflare Cron Triggers (15-min discovery poll + daily maintenance)

---

## 3. Requirements

- Node.js >= 20.0.0
- npm >= 10.0.0
- Wrangler CLI >= 3.100.0 (bundled in devDependencies)
- Cloudflare account with D1 database access

---

## 4. Installation & Local Setup

```bash
# 1. Clone repository and install dependencies
npm install

# 2. Configure local environment variables
cp .env.example .env

# 3. Apply local D1 migrations
npm run db:migrate:local

# 4. (Optional) Seed development data
npm run seed:dev

# 5. Start development servers
# Frontend dev server:
npm run dev

# Worker dev server:
npm run dev:worker
```

---

## 5. D1 Database & Migrations

VitaHarbor uses versioned SQL migrations stored in `migrations/`:

```bash
# Apply to local SQLite D1
npm run db:migrate:local

# Apply to production Cloudflare D1
npm run db:migrate:remote
```

---

## 6. Reddit Ingestion Configuration

Configure your Reddit script application credentials in `.env` (and Cloudflare Worker secrets for production):

```env
REDDIT_CLIENT_ID=your_reddit_app_id
REDDIT_CLIENT_SECRET=your_reddit_app_secret
REDDIT_USER_AGENT=VitaHarbor/1.0 (+https://vitaharbor.example)
REDDIT_REFRESH_TOKEN=your_oauth_refresh_token
```

---

## 7. Quality Gates & Testing

```bash
# Run linting
npm run lint

# Run strict TypeScript typechecking
npm run typecheck

# Run unit tests
npm run test:unit

# Run full test suite
npm run test

# Build production bundle
npm run build
```

---

## 8. Deployment

```bash
# Deploy to staging environment
npm run deploy:staging

# Deploy to production environment
npm run deploy
```

---

## 9. License & Disclaimer

Unofficial community project. Not affiliated with Sony Interactive Entertainment, Reddit, or any represented game publishers.


