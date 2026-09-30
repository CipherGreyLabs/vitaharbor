import { describe, it, expect } from "vitest";
import {
  checkSafetyAndPiracy,
  extractOutboundRepository,
  hasConcreteVitaProof,
  isOnVitaDb,
  evaluateCandidate
} from "../../scripts/auto-curate-pipeline.mjs";

describe("auto-curate-pipeline", () => {
  it("detects and rejects troll, prank, and AI slop posts", () => {
    const troll = {
      source: {
        title: "(AI SLOP) GTA LCS PS2 running on the Vita natively",
        body: "Me and my AI assistant vibecoded hallucinated code."
      }
    };
    const res = checkSafetyAndPiracy(troll);
    expect(res.ok).toBe(false);
    expect(res.type).toBe("troll");
  });

  it("detects and rejects illegal piracy and direct ROM host links", () => {
    const piracy = {
      source: {
        title: "New port release",
        body: "Download the ROM from https://vimm.net/vault/12345"
      }
    };
    const res = checkSafetyAndPiracy(piracy);
    expect(res.ok).toBe(false);
    expect(res.type).toBe("piracy");
  });

  it("identifies ports that are already available on VitaDB", () => {
    const mockVitaDb = [
      { name: "Apotris", titleid: "APOT00001" },
      { name: "NXENGINE-EVO", titleid: "NXEV00001" }
    ];
    expect(isOnVitaDb("Apotris", "apotris-psvita", mockVitaDb)).toBe(true);
    expect(isOnVitaDb("Completely New Ongoing Port", "new-ongoing-port-vita", mockVitaDb)).toBe(false);
  });

  it("extracts valid outbound git repository links", () => {
    const candidate = {
      source: {
        title: "My new Vita port",
        body: "Check source at https://github.com/vitatest/my-vita-port and build."
      }
    };
    const repo = extractOutboundRepository(candidate);
    expect(repo).toBe("https://github.com/vitatest/my-vita-port");
  });

  it("requires concrete Vita technical proof before promotion", () => {
    const vaguePost = {
      source: {
        title: "I might port this game",
        body: "Thinking about it someday."
      }
    };
    expect(hasConcreteVitaProof(vaguePost, "https://github.com/test/repo")).toBe(false);

    const realPost = {
      source: {
        title: "Native Vita port using VitaSDK and vitaGL",
        body: "Compiled with CMakeLists and running with ARMv7 shaders."
      }
    };
    expect(hasConcreteVitaProof(realPost, "https://github.com/test/repo")).toBe(true);
  });

  it("promotes a candidate when all criteria are satisfied", () => {
    const candidate = {
      id: "reddit-test123",
      source: {
        title: "[RELEASE] Super Game Vita Port v1.0",
        body: "Source code available at https://github.com/developer/super-game-vita using VitaSDK.",
        author: "TestDev",
        canonical_url: "https://www.reddit.com/r/vitahacks/comments/test123/super_game_vita/",
        published_at: "2026-09-29T12:00:00.000Z"
      }
    };

    const evaluation = evaluateCandidate(candidate, {
      vitaDbCatalog: [{ name: "OtherGame" }],
      ledgerSource: "export const FALLBACK_PROJECTS = [];"
    });

    expect(evaluation.action).toBe("PROMOTE");
    expect(evaluation.cleanTitle).toBe("Super Game");
    expect(evaluation.repoUrl).toBe("https://github.com/developer/super-game-vita");
  });
});
