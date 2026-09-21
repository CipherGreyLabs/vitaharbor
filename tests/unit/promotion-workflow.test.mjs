import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PROMOTER = path.join(ROOT, "scripts/promote-candidate.mjs");

describe("manual promotion workflow", () => {
  it("wires data:promote to promotion and refreshes the public queue with valid ledger syntax", () => {
    const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
    expect(pkg.scripts["data:promote"]).toContain("--promote");

    const fixture = mkdtempSync(path.join(tmpdir(), "vitaharbor-promote-"));
    try {
      mkdirSync(path.join(fixture, "data"), { recursive: true });
      mkdirSync(path.join(fixture, "public/data"), { recursive: true });
      mkdirSync(path.join(fixture, "src/shared/constants"), { recursive: true });

      const candidate = {
        schema_version: 2,
        id: "reddit-test123",
        state: "VERIFIED_FOR_REVIEW",
        source: {
          canonical_url: "https://www.reddit.com/r/vitahacks/comments/test123/example/",
          title: "Example native Vita port",
          subreddit: "vitahacks",
          published_at: "2026-09-20T12:00:00.000Z"
        },
        classification: { candidate_type: "port" },
        state_history: [{ state: "VERIFIED_FOR_REVIEW", at: "2026-09-20T12:10:00.000Z" }],
        risk_signals: [],
        evidence_gaps: []
      };
      writeFileSync(path.join(fixture, "data/quarantine.json"), JSON.stringify({
        schema_version: 2,
        generated_at: "2026-09-20T12:10:00.000Z",
        source: "r/vitahacks RSS",
        items: [candidate]
      }, null, 2));
      writeFileSync(path.join(fixture, "src/shared/constants/fallbackData.ts"), [
        "type Game = any;",
        "export const FALLBACK_GAMES: Game[] = [",
        "  { id: 1, slug: \"existing-game\", title: \"Existing\" }",
        "];",
        "",
        "export const FALLBACK_PROJECTS: any[] = [",
        "  {",
        "    id: 1,",
        "    game_id: 1,",
        "    slug: \"existing-project\"",
        "  }",
        "];",
        ""
      ].join("\n"));
      writeFileSync(path.join(fixture, "evidence.json"), JSON.stringify({
        reviewer: "test-reviewer",
        reviewed_at: "2026-09-20T12:15:00.000Z",
        sources: [
          { type: "reddit", observed_at: "2026-09-20T12:15:00.000Z" },
          { type: "repository", url: "https://github.com/example/example-vita", observed_at: "2026-09-20T12:15:00.000Z" }
        ],
        findings: "Repository and release evidence confirm a Vita project for this fixture.",
        repository_url: "https://github.com/example/example-vita",
        repository_identity: "example/example-vita",
        repository_created_at: "2026-09-19T10:00:00.000Z",
        repository_last_activity_at: "2026-09-20T11:00:00.000Z",
        release_facts: [{ tag: "v0.1", published_at: "2026-09-20T11:00:00.000Z" }],
        vita_hardware_result: "Fixture reports successful Vita execution.",
        vita_evidence: ["Vita-specific build output"],
        author_linkage: "Fixture author links the repository.",
        corroboration: [{ type: "release", detail: "Repository release exists." }]
      }, null, 2));

      const mismatch = spawnSync(process.execPath, [
        PROMOTER,
        "--promote",
        "--id", "reddit-test123",
        "--reviewer", "test-reviewer",
        "--reason", "Fixture promotion regression test",
        "--evidence-file", "evidence.json",
        "--name", "Example Vita Port",
        "--repo-url", "https://github.com/example/different-vita"
      ], { cwd: fixture, encoding: "utf8" });
      expect(mismatch.status).not.toBe(0);
      expect(mismatch.stderr).toContain("must exactly match");
      expect(JSON.parse(readFileSync(path.join(fixture, "data/quarantine.json"), "utf8")).items[0].state)
        .toBe("VERIFIED_FOR_REVIEW");

      const result = spawnSync(process.execPath, [
        PROMOTER,
        "--promote",
        "--id", "reddit-test123",
        "--reviewer", "test-reviewer",
        "--reason", "Fixture promotion regression test",
        "--evidence-file", "evidence.json",
        "--name", "Example Vita Port",
        "--repo-url", "https://github.com/example/example-vita"
      ], { cwd: fixture, encoding: "utf8" });

      expect(result.status, result.stderr || result.stdout).toBe(0);
      const quarantine = JSON.parse(readFileSync(path.join(fixture, "data/quarantine.json"), "utf8"));
      const publicQueue = JSON.parse(readFileSync(path.join(fixture, "public/data/discovered.json"), "utf8"));
      expect(quarantine.items[0].state).toBe("PROMOTED");
      expect(publicQueue.items).toEqual([]);

      const ledger = readFileSync(path.join(fixture, "src/shared/constants/fallbackData.ts"), "utf8");
      const parsed = ts.createSourceFile("fallbackData.ts", ledger, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      expect(parsed.parseDiagnostics).toEqual([]);
      expect(ledger).toContain('slug: "example-vita-port"');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("does not advance provenance state when the curated ledger cannot be prepared", () => {
    const fixture = mkdtempSync(path.join(tmpdir(), "vitaharbor-promote-fail-"));
    try {
      mkdirSync(path.join(fixture, "data"), { recursive: true });
      mkdirSync(path.join(fixture, "public/data"), { recursive: true });
      mkdirSync(path.join(fixture, "src/shared/constants"), { recursive: true });
      writeFileSync(path.join(fixture, "data/quarantine.json"), JSON.stringify({
        schema_version: 2,
        generated_at: "2026-09-20T12:10:00.000Z",
        source: "r/vitahacks RSS",
        items: [{
          schema_version: 2,
          id: "reddit-fail123",
          state: "VERIFIED_FOR_REVIEW",
          source: {
            canonical_url: "https://www.reddit.com/r/vitahacks/comments/fail123/example/",
            title: "Example native Vita port",
            subreddit: "vitahacks",
            published_at: "2026-09-20T12:00:00.000Z"
          },
          classification: { candidate_type: "port" },
          state_history: [{ state: "VERIFIED_FOR_REVIEW", at: "2026-09-20T12:10:00.000Z" }],
          risk_signals: [],
          evidence_gaps: []
        }]
      }, null, 2));
      const before = readFileSync(path.join(fixture, "data/quarantine.json"), "utf8");
      writeFileSync(path.join(fixture, "src/shared/constants/fallbackData.ts"), "export const BROKEN = true;\n");
      writeFileSync(path.join(fixture, "evidence.json"), JSON.stringify({
        reviewer: "test-reviewer",
        sources: [{ type: "repository", url: "https://github.com/example/example-vita", observed_at: "2026-09-20T12:15:00.000Z" }],
        findings: "Valid fixture evidence with a deliberately invalid curated ledger target.",
        repository_url: "https://github.com/example/example-vita",
        repository_identity: "example/example-vita",
        repository_created_at: "2026-09-19T10:00:00.000Z",
        repository_last_activity_at: "2026-09-20T11:00:00.000Z",
        release_facts: [{ tag: "v0.1", published_at: "2026-09-20T11:00:00.000Z" }],
        vita_hardware_result: "Fixture reports successful Vita execution.",
        vita_evidence: ["Vita-specific build output"],
        author_linkage: "Fixture author links the repository.",
        corroboration: [{ type: "release", detail: "Repository release exists." }]
      }, null, 2));

      const result = spawnSync(process.execPath, [
        PROMOTER,
        "--promote",
        "--id", "reddit-fail123",
        "--reviewer", "test-reviewer",
        "--reason", "Fixture promotion rollback regression test",
        "--evidence-file", "evidence.json",
        "--name", "Example Vita Port",
        "--repo-url", "https://github.com/example/example-vita"
      ], { cwd: fixture, encoding: "utf8" });

      expect(result.status).not.toBe(0);
      expect(readFileSync(path.join(fixture, "data/quarantine.json"), "utf8")).toBe(before);
      expect(() => readFileSync(path.join(fixture, "data/provenance-audit.jsonl"), "utf8")).toThrow();
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});
