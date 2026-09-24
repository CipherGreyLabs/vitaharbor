import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { REDDIT_SOURCE_LABEL, REDDIT_SOURCES, REDDIT_SUBREDDITS, redditRssUrl, redditSearchRssUrl } from "../../scripts/reddit-sources.mjs";
import { classify, classifyCandidateType, isTrackableCandidateCategory, isTrackableCandidateType, parseEntries } from "../../scripts/reddit-classifier.mjs";
import { shouldRetainInternalCandidate } from "../../scripts/reddit-provenance.mjs";

describe("Reddit discovery scope", () => {
  it("keeps all three communities in one canonical scan scope", () => {
    expect(REDDIT_SUBREDDITS).toEqual(["vitahacks", "VitaPiracy", "PSVitaHomebrew"]);
    expect(REDDIT_SOURCES.map((source) => source.displayName)).toEqual([
      "r/vitahacks",
      "r/VitaPiracy",
      "r/PSVitaHomebrew"
    ]);
    expect(REDDIT_SOURCE_LABEL).toBe("r/vitahacks + r/VitaPiracy + r/PSVitaHomebrew");
    expect(redditRssUrl("PSVitaHomebrew")).toBe("https://www.reddit.com/r/PSVitaHomebrew/new.rss");
    const backfillUrl = redditSearchRssUrl("VitaPiracy", "port OR recompiled", "month");
    expect(backfillUrl).toContain("/r/VitaPiracy/search.rss?");
    expect(backfillUrl).toContain("restrict_sr=on");
    expect(backfillUrl).toContain("sort=new");
    expect(backfillUrl).toContain("t=month");
  });

  it("runs scanner CI when source configuration or classifier logic changes", () => {
    const workflow = readFileSync(path.resolve(import.meta.dirname, "../../.github/workflows/reddit-scanner.yml"), "utf8");
    const scanner = readFileSync(path.resolve(import.meta.dirname, "../../scripts/cron-reddit-scan.mjs"), "utf8");
    const backfill = readFileSync(path.resolve(import.meta.dirname, "../../scripts/reddit-backfill.ts"), "utf8");
    expect(workflow).toContain('"scripts/reddit-sources.mjs"');
    expect(workflow).toContain('"scripts/reddit-classifier.mjs"');
    expect(workflow).toContain('"scripts/reddit-provenance.mjs"');
    expect(workflow).not.toContain("finalize-scanner-health");
    expect(workflow).toContain("id: publish");
    expect(workflow).toContain("git push origin HEAD:main");
    expect(workflow).toContain("git ls-remote origin refs/heads/main");
    expect(workflow).toContain('"scripts/reddit-backfill.ts"');
    expect(workflow).toContain("npm run reddit:backfill");
    expect(workflow).toContain('cron: "17 7 * * *"');
    expect(workflow).toContain('cron: "17 13 * * *"');
    expect(workflow).toContain('cron: "17 19 * * *"');
    expect(workflow).toContain("github.event.schedule == '17 7 * * *'");
    for (const stepName of ["Scan Reddit for new port threads", "Rebuild public feeds", "Commit discovery results"]) {
      const step = workflow.split(`- name: ${stepName}`)[1]?.split(/\n      - name:/)[0] || "";
      expect(step).toContain("if: ${{ github.event_name == 'schedule' || github.event_name == 'workflow_dispatch' }}");
    }
    const backfillStep = workflow.split("- name: Backfill recent Reddit history")[1]?.split(/\n      - name:/)[0] || "";
    expect(backfillStep).toContain("if: ${{ github.event_name == 'workflow_dispatch' || (github.event_name == 'schedule' && github.event.schedule == '17 7 * * *') }}");
    const publishVerification = workflow.split("- name: Verify published scanner commit")[1]?.split(/\n      - name:/)[0] || "";
    expect(publishVerification).toContain("if: ${{ (github.event_name == 'schedule' || github.event_name == 'workflow_dispatch') && steps.publish.outcome == 'success' }}");
    expect(backfill).toContain("fetchRedditFeed(url, { userAgent: USER_AGENT })");
    expect(backfill.indexOf("if (successfulFeeds === 0)")).toBeGreaterThan(-1);
    const noFeedExit = backfill.indexOf("if (successfulFeeds === 0)");
    expect([...backfill.matchAll(/fs\.writeFileSync/g)].every((match) => match.index > noFeedExit)).toBe(true);
    expect(scanner).toContain("TERMINAL_STATES.includes(item.state)");
    expect(scanner).toContain("isTrackableCandidateType(candidateType)");
    expect(scanner).toContain("activeItems");
    expect(scanner).toContain("terminalItems");
    expect(scanner).toContain(".slice(0, MAX_ITEMS)");
  });

  it("uses GitHub Actions as the only scheduled scanner", () => {
    const root = path.resolve(import.meta.dirname, "../..");
    const vercel = JSON.parse(readFileSync(path.join(root, "vercel.json"), "utf8"));
    expect(vercel.crons).toBeUndefined();
    expect(existsSync(path.join(root, "api/cron-scan.ts"))).toBe(false);
    expect(existsSync(path.join(root, "tests/unit/cron-scan-route.test.ts"))).toBe(false);
  });

  it("retains non-terminal provenance internally while excluding curated leads", () => {
    const record = { state: "QUARANTINED", source: { canonical_url: "https://www.reddit.com/r/vitahacks/comments/legacy01/legacy/" } };
    const rejected = { state: "REJECTED", source: { canonical_url: "https://www.reddit.com/r/vitahacks/comments/rejected01/rejected/" } };
    const known = new Set(["/r/vitahacks/comments/curated01/curated"]);
    expect(shouldRetainInternalCandidate(record, known)).toBe(true);
    expect(shouldRetainInternalCandidate(rejected, known)).toBe(true);
    expect(shouldRetainInternalCandidate({ ...record, source: { canonical_url: "https://www.reddit.com/r/vitahacks/comments/curated01/curated/" } }, known)).toBe(false);
  });
});

describe("Reddit candidate classifier", () => {
  it("accepts a source-backed port announcement without changing its type", () => {
    const result = classify({
      title: "[Pre-Release] C-Dogs SDL port for PS Vita / PSTV",
      body: "Native Vita/PSTV build tested on real hardware. GitHub releases and source are linked."
    });
    expect(result.accept).toBe(true);
    expect(result.confidence).toBe("high");
    expect(classifyCandidateType({ title: "C-Dogs SDL port", body: "native build" })).toBe("port");
  });

  it("accepts concrete boot and progress posts seen in the three-community scan", () => {
    const forceEngine = classify({
      title: "TheForceEngine-VITA - Successfully booting into the menu",
      body: "Still have much work to do but i got the main menu working"
    });
    const testDrive = classify({
      title: "Test Drive (1987) native Vita port",
      body: "Initial release of the native port"
    });
    const rr2 = classify({
      title: "Updates on RR2 Port",
      body: "Port progress: menu is running and touch controls now work"
    });

    expect(forceEngine.accept).toBe(true);
    expect(forceEngine.question).toBe(false);
    expect(testDrive.accept).toBe(true);
    expect(rr2.accept).toBe(true);

    const worldAtWar = classify({
      title: "Gameplay: World at War Zombies ported to the PS Vita",
      body: "Gameplay capture from the current Vita port build."
    });
    const superTuxKart = classify({
      title: "SuperTuxKart W.I.P port for PlayStation Vita with Vulkan",
      body: "Work in progress Vita port."
    });
    expect(worldAtWar.accept).toBe(true);
    expect(superTuxKart.accept).toBe(true);
    expect(testDrive.category).toBe("new_project");
    expect(rr2.category).toBe("project_update");
    expect(isTrackableCandidateCategory(forceEngine.category)).toBe(true);
  });

  it("keeps concrete WIP posts when the author also asks for posting advice", () => {
    const result = classify({
      title: "[WIP] BuckshotRoulettePortable - A C++ rewrite of Buckshot Roulette for the PSVITA Targeting 60fps",
      body: "I'm not sure where to post this. I am going with a C++ rewrite with a custom engine. Using VitaGL and trying to minimize the Godot coroutines."
    });
    expect(result.accept).toBe(true);
    expect(result.question).toBe(false);
    expect(result.category).toBe("project_update");
  });

  it("accepts the Halo CE recompilation wording that the original scanner missed", () => {
    const halo = classify({
      title: "Halo CE Recompiled for the PS Vita",
      body: "Almost everything is rendering on the Vita. The main priority is performance. This early build gets 8 - 14 fps and campaign mode works."
    });
    expect(halo.accept).toBe(true);
    expect(halo.confidence).toBe("high");
    expect(halo.question).toBe(false);
    expect(classifyCandidateType({ title: "Halo CE Recompiled for the PS Vita", body: "early Vita build" })).toBe("port");
  });

  it("decodes Reddit RSS HTML before classification and URL extraction", () => {
    const xml = `<feed><entry><title>Gameplay: World at War Zombies ported to the PS Vita</title><link href="https://www.reddit.com/r/vitahacks/comments/rss123/example/"/><name>/u/dev</name><updated>2026-09-21T12:00:00Z</updated><content type="html">&lt;table&gt;&lt;tr&gt;&lt;td&gt;&lt;a href=&quot;https://example.com/image&quot;&gt;preview&lt;/a&gt;&lt;/td&gt;&lt;td&gt;&lt;div class=&quot;md&quot;&gt;&lt;p&gt;Native Vita gameplay build is now ported and playable.&lt;/p&gt;&lt;a href=&quot;https://github.com/example/vita-port&quot;&gt;source&lt;/a&gt;&lt;/div&gt;&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;</content></entry></feed>`;
    const [entry] = parseEntries(xml);
    expect(entry.body).toContain("Native Vita gameplay build");
    expect(entry.body).not.toContain("&lt;table&gt;");
    expect(entry.outbound_urls).toContain("https://github.com/example/vita-port");
    expect(classify(entry).question).toBe(false);
    expect(classify(entry).accept).toBe(true);
  });

  it("rejects multilingual patch or port requests instead of treating patch as development", () => {
    const result = classify({
      title: "Demande de patch FR",
      body: "Je cherche un patch pour Vita."
    });
    expect(result.accept).toBe(false);
    expect(result.question).toBe(true);
    expect(result.reason).toContain("question");
  });

  it("keeps plugins and general tools outside the port-development scanner scope", () => {
    expect(isTrackableCandidateType(classifyCandidateType({
      title: "[Release] Remastered Controls for PS Vita / Adrenaline",
      body: "controller plugin"
    }))).toBe(false);
    expect(isTrackableCandidateType(classifyCandidateType({
      title: "Building an app for all things Vita",
      body: "database tracker tool"
    }))).toBe(false);
    expect(isTrackableCandidateType(classifyCandidateType({
      title: "[RELEASE] RetroFlow-Launcher Version 8.4.1",
      body: "Vita launcher release"
    }))).toBe(false);
    expect(isTrackableCandidateType(classifyCandidateType({
      title: "Porting Darkest Dungeon classes/mods from PC to PS Vita",
      body: "modding guide"
    }))).toBe(false);
    expect(isTrackableCandidateType("port")).toBe(true);
    expect(isTrackableCandidateType("decompilation")).toBe(true);
    expect(isTrackableCandidateType("wrapper")).toBe(true);
  });

  it("keeps question posts out of the candidate queue", () => {
    const result = classify({
      title: "Is it possible to port this game to PS Vita?",
      body: "Would anyone be able to make a port?"
    });
    expect(result.accept).toBe(false);
    expect(result.reason).toContain("question");
  });

  it("classifies discussion and project identity separately from loose port terms", () => {
    const discussion = classify({
      title: "We need to talk",
      body: "There has to be a way to eliminate vibecoders that release slop ports. These ports should have never been released."
    });
    const wip = classify({
      title: "OpenMoHAA on PS Vita [WIP]",
      body: "Native build boots in game on real hardware."
    });
    expect(discussion.category).toBe("discussion");
    expect(discussion.accept).toBe(false);
    expect(wip.category).toBe("project_update");
    expect(wip.accept).toBe(true);
  });

  it("labels requests and unrelated utilities outside the project queue", () => {
    expect(classify({ title: "Can someone port this?", body: "I want this game on Vita." }).category).toBe("question");
    expect(classify({ title: "[Release] Vita controller plugin", body: "Input support for Adrenaline." }).category).toBe("out_of_scope");
  });

  it("rejects promotional spam even when it mentions the Vita", () => {
    const result = classify({
      title: "Free crypto giveaway for Vita users",
      body: "Click here for a referral code and free money."
    });
    expect(result.accept).toBe(false);
    expect(result.reason).toContain("spam");
  });
});
