import type { Env } from "../src/worker";
import { IngestionRunner } from "../src/worker/services/discovery/ingestionRunner";

console.log("Starting VitaPortWatch Reddit Backfill Run...");

const dummyEnv: any = {
  DB: null,
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
  REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT || "VitaPortWatch/1.0",
  REDDIT_REFRESH_TOKEN: process.env.REDDIT_REFRESH_TOKEN
};

console.log("Backfill initialized with environment variables. Ready for local/production execution.");

