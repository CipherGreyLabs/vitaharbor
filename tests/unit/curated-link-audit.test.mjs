import { describe, expect, it } from "vitest";
import { auditLink, extractCuratedLinks } from "../../scripts/audit-curated-links.mjs";

function response(body, status = 200, headers = {}) {
  return new Response(body, { status, headers: { "content-type": "text/html", ...headers } });
}

describe("curated link audit", () => {
  it("extracts only curated source, repository, screenshot and release fields", () => {
    const links = extractCuratedLinks(`
      { display_name: "Example Port", reddit_url: "https://www.reddit.com/r/vitahacks/comments/abc123/example/", repo_url: "https://github.com/example/port" },
      { screenshot_source_url: "https://github.com/example/port/blob/main/screenshot.png" },
      { sourceUrl: "https://github.com/example/port", relationship: "release", canonical_url: "https://github.com/example/port/releases/tag/v1" }
    `);
    expect(links.map((link) => link.kind)).toEqual(["source", "repository", "source", "source", "release"]);
    expect(links).toHaveLength(5);
  });

  it("reports dead, redirect and unverifiable responses distinctly", async () => {
    await expect(auditLink({ id: "dead", field: "repo_url", kind: "repository", url: "https://github.com/missing/project", expected_context: "Project", line: 1 }, async () => response("gone", 404))).resolves.toMatchObject({ status: "dead", http_status: 404 });
    await expect(auditLink({ id: "redirect", field: "reddit_url", kind: "source", url: "https://www.reddit.com/r/vitahacks/comments/abc123/project/", expected_context: "Project", line: 1 }, async () => response("", 301, { location: "https://www.reddit.com/r/vitahacks/comments/def456/project/" }))).resolves.toMatchObject({ status: "redirect", final_url: "https://www.reddit.com/r/vitahacks/comments/def456/project/" });
    await expect(auditLink({ id: "blocked", field: "repo_url", kind: "repository", url: "https://github.com/example/project", expected_context: "Project", line: 1 }, async () => response("rate limited", 429))).resolves.toMatchObject({ status: "unverifiable", http_status: 429 });
  });

  it("requires repository content identity before calling a target wrong", async () => {
    const fetcher = async (input) => {
      const url = String(input);
      if (url === "https://github.com/wrong/unrelated") return response("repo page", 200);
      if (url === "https://api.github.com/repos/wrong/unrelated") return new Response(JSON.stringify({ full_name: "wrong/unrelated", name: "unrelated", description: "A completely different project", topics: [], default_branch: "main" }), { status: 200, headers: { "content-type": "application/json" } });
      if (url.startsWith("https://api.github.com/repos/wrong/unrelated/readme")) return new Response(JSON.stringify({ content: "", encoding: "base64" }), { status: 200, headers: { "content-type": "application/json" } });
      throw new Error("unexpected request " + url);
    };
    const result = await auditLink({ id: "wrong", field: "repo_url", kind: "repository", url: "https://github.com/wrong/unrelated", expected_context: "SuperTuxKart Vita", line: 1 }, fetcher);
    expect(result.status).toBe("wrong-target");
    expect(result.evidence).toContain("Repository content identifies");
  });
});
