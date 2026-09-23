import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const LEDGER = path.resolve(ROOT, "src/shared/constants/fallbackData.ts");
const DEFAULT_JSON = path.resolve(ROOT, "docs/CURATED_LINK_AUDIT_2026-09-23.json");
const DEFAULT_MARKDOWN = path.resolve(ROOT, "docs/CURATED_LINK_AUDIT_2026-09-23.md");
const BROWSER_REVIEW = path.resolve(ROOT, "docs/CURATED_LINK_BROWSER_REVIEW_2026-09-23.json");
const LINK_FIELDS = new Map([
  ["reddit_url", "source"],
  ["repo_url", "repository"],
  ["screenshot_source_url", "source"],
  ["sourceUrl", "source"],
  ["canonical_url", "release"]
]);
const MAX_BODY_BYTES = 256 * 1024;
const REQUEST_TIMEOUT_MS = 8000;

function significantTokens(value) {
  const stop = new Set(["a", "an", "and", "for", "from", "game", "of", "on", "port", "ports", "ps", "psvita", "playstation", "the", "to", "vita"]);
  return [...new Set(String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter((token) => token.length > 2 && !stop.has(token)))];
}

function contextFor(lines, index) {
  for (let cursor = index; cursor >= Math.max(0, index - 50); cursor -= 1) {
    const line = lines[cursor];
    const display = line.match(/\b(?:display_name|game_title):\s*["']([^"']+)["']/);
    if (display) return display[1];
    const slug = line.match(/\bslug:\s*["']([^"']+)["']/);
    if (slug) return slug[1];
    const source = line.match(/\bsource_item_id:\s*["']([^"']+)["']/);
    if (source) return source[1];
  }
  return "unknown curated item";
}

export function extractCuratedLinks(source) {
  const lines = String(source).split(/\r?\n/);
  const links = [];
  const seen = new Set();
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/\b(reddit_url|repo_url|screenshot_source_url|sourceUrl|canonical_url):\s*["'](https?:\/\/[^"']+)["']/g)) {
      const field = match[1];
      const url = match[2];
      const kind = field === "canonical_url"
        ? (/\brelationship:\s*["']release["']/i.test(line) ? "release" : "source")
        : (LINK_FIELDS.get(field) || "source");
      const key = field + "\u0000" + url + "\u0000" + contextFor(lines, index);
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({
        id: "link-" + (links.length + 1).toString().padStart(3, "0"),
        field,
        kind,
        url,
        expected_context: contextFor(lines, index),
        line: index + 1
      });
    }
  });
  return links;
}

function githubRepoUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.toLowerCase() !== "github.com") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, ""), path: parts.slice(2).join("/") };
  } catch {
    return null;
  }
}

async function readBody(response) {
  const reader = response.body?.getReader();
  if (!reader) return (await response.text()).slice(0, MAX_BODY_BYTES);
  const chunks = [];
  let bytes = 0;
  while (bytes < MAX_BODY_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
    const remaining = MAX_BODY_BYTES - bytes;
    const bounded = chunk.byteLength > remaining ? chunk.slice(0, remaining) : chunk;
    chunks.push(bounded);
    bytes += bounded.byteLength;
    if (bounded.byteLength < chunk.byteLength) {
      await reader.cancel();
      break;
    }
  }
  const all = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    all.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(all);
}

async function request(url, fetcher) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetcher(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        accept: "application/json, text/html;q=0.9, */*;q=0.1",
        "user-agent": "VitaHarbor curated-link-audit/1.0"
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

function responseClass(status) {
  if (status >= 300 && status < 400) return "redirect";
  if (status === 404 || status === 410 || status >= 500) return "dead";
  if (status === 401 || status === 403 || status === 408 || status === 429) return "unverifiable";
  if (status >= 200 && status < 300) return "ok";
  return "unverifiable";
}

function readBrowserReview(file = BROWSER_REVIEW) {
  try {
    const document = JSON.parse(fs.readFileSync(file, "utf8"));
    const results = Array.isArray(document.results) ? document.results : [];
    return {
      file: path.relative(ROOT, file).replaceAll("\\", "/"),
      byUrl: new Map(results.map((result) => [result.url, result]))
    };
  } catch {
    return { file: null, byUrl: new Map() };
  }
}

async function verifyGithubContent(link, response, fetcher) {
  const repo = githubRepoUrl(link.url);
  if (!repo) return { status: "ok", evidence: "HTTP 2xx response; non-GitHub content check not applicable" };
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}`;
  const apiResponse = await request(apiUrl, fetcher);
  const apiClass = responseClass(apiResponse.status);
  if (apiClass !== "ok") {
    return { status: apiClass === "dead" ? "dead" : "unverifiable", evidence: `GitHub repository identity API returned HTTP ${apiResponse.status}` };
  }
  let metadata;
  try {
    metadata = JSON.parse(await readBody(apiResponse));
  } catch {
    return { status: "unverifiable", evidence: "GitHub repository identity response was not valid JSON" };
  }
  let readme = "";
  const readmeUrl = "https://api.github.com/repos/" + encodeURIComponent(repo.owner) + "/" + encodeURIComponent(repo.repo) + "/readme?ref=" + encodeURIComponent(metadata.default_branch || "main");
  const readmeResponse = await request(readmeUrl, fetcher);
  if (responseClass(readmeResponse.status) === "ok") {
    try {
      const readmePayload = JSON.parse(await readBody(readmeResponse));
      if (typeof readmePayload.content === "string" && readmePayload.encoding === "base64") {
        readme = Buffer.from(readmePayload.content.replace(/\s/g, ""), "base64").toString("utf8").slice(0, MAX_BODY_BYTES);
      }
    } catch {
      readme = "";
    }
  }
  const corpus = [metadata.full_name, metadata.name, metadata.description, ...(Array.isArray(metadata.topics) ? metadata.topics : []), readme].join(" ");
  const expected = significantTokens(link.expected_context);
  const matched = expected.filter((token) => corpus.toLowerCase().includes(token));
  if (expected.length >= 1 && matched.length === 0) {
    return { status: "wrong-target", evidence: `Repository content identifies ${metadata.full_name || repo.owner + "/" + repo.repo}; none of the expected project tokens matched`, content_identity: metadata.full_name || null };
  }
  if (repo.path && link.kind === "release" && repo.path.startsWith("releases/tag/")) {
    const tag = repo.path.slice("releases/tag/".length).split("/")[0];
    const releaseUrl = `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/releases/tags/${encodeURIComponent(tag)}`;
    const releaseResponse = await request(releaseUrl, fetcher);
    const releaseClass = responseClass(releaseResponse.status);
    if (releaseClass === "dead") return { status: "dead", evidence: `GitHub repository exists but the linked release returned HTTP ${releaseResponse.status}`, content_identity: metadata.full_name || null };
    if (releaseClass === "unverifiable") return { status: "unverifiable", evidence: `GitHub repository exists but the linked release check returned HTTP ${releaseResponse.status}`, content_identity: metadata.full_name || null };
  } else if (repo.path && link.kind === "source") {
    const pathParts = repo.path.split("/");
    const contentPath = pathParts[0] === "blob" || pathParts[0] === "tree" ? pathParts.slice(2).join("/") : repo.path;
    const contentsUrl = `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/contents/${contentPath}`;
    const contentsResponse = await request(contentsUrl, fetcher);
    const contentsClass = responseClass(contentsResponse.status);
    if (contentsClass === "dead") return { status: "dead", evidence: `GitHub repository exists but the linked path returned HTTP ${contentsResponse.status}`, content_identity: metadata.full_name || null };
    if (contentsClass === "unverifiable") return { status: "unverifiable", evidence: `GitHub repository exists but the linked path check returned HTTP ${contentsResponse.status}`, content_identity: metadata.full_name || null };
  }
  return { status: "ok", evidence: `GitHub repository identity/content checked as ${metadata.full_name || repo.owner + "/" + repo.repo}`, content_identity: metadata.full_name || null };
}

async function verifyRedditContent(link, response, fetcher) {
  const body = await readBody(response);
  const expected = significantTokens(link.expected_context);
  const matched = expected.filter((token) => body.toLowerCase().includes(token));
  if (expected.length >= 2 && matched.length === 0 && body.length > 1000) {
    return { status: "wrong-target", evidence: "HTTP 2xx Reddit response did not contain the expected project identity" };
  }
  return { status: "ok", evidence: body.length ? "HTTP 2xx Reddit response inspected; project identity not disproven" : "HTTP 2xx with empty body" };
}

export async function auditLink(link, fetcher = fetch) {
  try {
    const response = await request(link.url, fetcher);
    const initial = responseClass(response.status);
    if (initial === "dead" || initial === "unverifiable") {
      return { ...link, status: initial, http_status: response.status, final_url: response.url || null, evidence: `Initial request returned HTTP ${response.status}` };
    }
    if (initial === "redirect") {
      const location = response.headers.get("location");
      if (!location) return { ...link, status: "redirect", http_status: response.status, final_url: null, evidence: "Redirect response did not expose a Location header" };
      const finalUrl = new URL(location, link.url).toString();
      const finalResponse = await request(finalUrl, fetcher);
      const finalClass = responseClass(finalResponse.status);
      if (finalClass === "dead") return { ...link, status: "dead", http_status: finalResponse.status, final_url: finalUrl, evidence: `Redirect target returned HTTP ${finalResponse.status}` };
      if (finalClass === "unverifiable") return { ...link, status: "unverifiable", http_status: finalResponse.status, final_url: finalUrl, evidence: `Redirect target could not be verified (HTTP ${finalResponse.status})` };
      const checked = githubRepoUrl(finalUrl) ? await verifyGithubContent({ ...link, url: finalUrl }, finalResponse, fetcher) : { status: "redirect", evidence: `Redirected to ${finalUrl}` };
      return { ...link, ...checked, http_status: response.status, final_url: finalUrl, redirected_from: link.url };
    }
    const checked = link.url.includes("reddit.com")
      ? await verifyRedditContent(link, response, fetcher)
      : await verifyGithubContent(link, response, fetcher);
    return { ...link, ...checked, http_status: response.status, final_url: response.url || link.url };
  } catch (error) {
    return { ...link, status: "unverifiable", http_status: null, final_url: null, evidence: `Request failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

async function auditAll(links, fetcher = fetch, concurrency = 6) {
  const results = [];
  let cursor = 0;
  async function worker() {
    while (cursor < links.length) {
      const index = cursor++;
      results[index] = await auditLink(links[index], fetcher);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, links.length) }, () => worker()));
  return results;
}

function markdownReport(document) {
  const counts = Object.entries(document.summary).map(([status, count]) => `${status}: ${count}`).join(" · ");
  const browserCount = new Set(document.results.filter((item) => item.browser_review?.status === "browser_verified").map((item) => item.url)).size;
  const rows = document.results.map((item) => {
    const browser = item.browser_review ? `${item.browser_review.status}: ${item.browser_review.assessment}` : "none";
    return `| ${item.status} | ${item.kind} | ${item.expected_context.replace(/\|/g, "\\|")} | ${item.url} | ${item.evidence.replace(/\|/g, "\\|")} | ${browser.replace(/\|/g, "\\|")} |`;
  }).join("\n");
  return `# Curated link integrity audit — 2026-09-23\n\nGenerated at ${document.generated_at}. This is a non-destructive report over curated source, repository, screenshot and release links in \`src/shared/constants/fallbackData.ts\`. No URL was replaced automatically.\n\nWrong-target is reported only after a content/identity check; an HTTP 200 alone is not treated as proof of correctness.\n\nSummary: ${counts} · browser-verified unique Reddit URLs: ${browserCount}\n\nThe direct HTTP audit can report Reddit as UNKNOWN/UNVERIFIABLE because Reddit returns HTTP 403 to the non-browser fetcher. Where possible, the companion read-only authenticated-browser review records the page title and content assessment per URL.\n\n| Status | Kind | Curated context | URL | HTTP evidence | Browser review |\n|---|---|---|---|---|---|\n${rows}\n\n## Correction policy\n\nNo corrections were applied. A dead, redirecting or wrong-target link needs an individually verified replacement and an append-only worklog entry before any source file is changed. Unverifiable links remain unchanged. Direct game-data links observed inside Reddit posts are never adopted as curated VitaHarbor links.\n`;
}

export async function runAudit({ sourceFile = LEDGER, jsonFile = DEFAULT_JSON, markdownFile = DEFAULT_MARKDOWN, fetcher = fetch } = {}) {
  const links = extractCuratedLinks(fs.readFileSync(sourceFile, "utf8"));
  const results = await auditAll(links, fetcher);
  const browserReview = readBrowserReview();
  const reviewedResults = results.map((result) => ({
    ...result,
    browser_review: browserReview.byUrl.get(result.url) || null
  }));
  const summary = Object.fromEntries(["ok", "dead", "redirect", "wrong-target", "unverifiable"].map((status) => [status, reviewedResults.filter((item) => item.status === status).length]));
  const document = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    source_file: path.relative(ROOT, sourceFile).replaceAll("\\", "/"),
    correction_policy: "report-only; no automatic URL replacement",
    browser_review_file: browserReview.file,
    summary,
    results: reviewedResults
  };
  fs.writeFileSync(jsonFile, JSON.stringify(document, null, 2) + "\n", "utf8");
  fs.writeFileSync(markdownFile, markdownReport(document), "utf8");
  return document;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const document = await runAudit();
  console.log(JSON.stringify({ links: document.results.length, summary: document.summary, json: DEFAULT_JSON, markdown: DEFAULT_MARKDOWN }, null, 2));
}
