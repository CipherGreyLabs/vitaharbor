import { Hono } from "hono";
import { publicApi } from "./routes/public";
import { adminApi } from "./routes/admin";
import { IngestionRunner } from "./services/discovery/ingestionRunner";
import { MaintenanceService } from "./services/cleanup/maintenanceService";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  REDDIT_CLIENT_ID?: string;
  REDDIT_CLIENT_SECRET?: string;
  REDDIT_USER_AGENT?: string;
  REDDIT_REFRESH_TOKEN?: string;
  ENVIRONMENT?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Security headers middleware
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';"
  );
});

// Health check endpoint per Blueprint Section 125
app.get("/api/health", async (c) => {
  let dbReachable = false;
  let lastIngestionSuccess: string | null = null;

  if (c.env.DB) {
    try {
      const dbCheck = await c.env.DB.prepare("SELECT 1 as healthy").first<{ healthy: number }>();
      if (dbCheck && dbCheck.healthy === 1) {
        dbReachable = true;
      }
      const lastRun = await c.env.DB.prepare(
        "SELECT finished_at FROM ingestion_runs WHERE status = 'completed' ORDER BY finished_at DESC LIMIT 1"
      ).first<{ finished_at: string | null }>();
      if (lastRun && lastRun.finished_at) {
        lastIngestionSuccess = lastRun.finished_at;
      }
    } catch {
      dbReachable = false;
    }
  }

  const redditConfigured = Boolean(
    c.env.REDDIT_CLIENT_ID &&
    c.env.REDDIT_CLIENT_SECRET &&
    c.env.REDDIT_REFRESH_TOKEN
  );

  return c.json({
    status: dbReachable ? "healthy" : "degraded",
    database_reachable: dbReachable,
    reddit_ingestion_configured: redditConfigured,
    last_ingestion_success_at: lastIngestionSuccess,
    timestamp: new Date().toISOString()
  });
});

// Mount Public API
app.route("/api", publicApi);
app.route("/api/admin", adminApi);

// Fallback to static assets for non-API routes when served through Worker
app.all("*", async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.notFound();
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        try {
          if (event.cron === "0 3 * * *" || event.cron === "17 3 * * *") {
            const maintenance = new MaintenanceService(env);
            await maintenance.runDailyMaintenance();
          } else {
            const runner = new IngestionRunner(env);
            await runner.runPoll();
          }
        } catch (e) {
          console.error("Cron execution error:", e);
        }
      })()
    );
  }
};
