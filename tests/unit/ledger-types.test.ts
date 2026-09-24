import { describe, expect, it } from "vitest";
import {
  deriveProjectType,
  deriveSetupGuide,
  verificationMeta,
  type LedgerProject
} from "../../src/web/components/ledger/types";

const project = (overrides: Partial<LedgerProject> = {}): LedgerProject => ({
  id: 1,
  slug: "sample-vita",
  display_name: "Sample Vita",
  current_stage: "in_game",
  summary: "A sample project record.",
  ...overrides
});

describe("ledger presentation taxonomy", () => {
  it("classifies projects from recorded platform and technology signals", () => {
    expect(deriveProjectType(project({ original_platform: "Android ARMv7" }))).toBe("wrapper");
    expect(deriveProjectType(project({ original_platform: "GameCube / Decomp" }))).toBe("decomp");
    expect(deriveProjectType(project({ original_platform: "PC / Ren'Py" }))).toBe("engine");
    expect(deriveProjectType(project({ technologies: ["Native C++"] }))).toBe("native");
    expect(deriveProjectType(project({ original_platform: "PC" }))).toBe("classic");
  });

  it("never invents setup instructions from a project category", () => {
    expect(deriveSetupGuide(project({ original_platform: "Android ARMv7" }))).toBeNull();
    expect(
      deriveSetupGuide(
        project({
          setup_evidence: {
            plugins: ["example.skprx"],
            sourceUrl: "https://example.test/setup"
          }
        })
      )
    ).toEqual({ plugins: ["example.skprx"], sourceUrl: "https://example.test/setup" });
  });

  it("keeps unknown verification explicit", () => {
    expect(verificationMeta("not-recorded").label).toBe("Verification not recorded");
    expect(verificationMeta("detected").label).toBe("Unverified community report");
  });
});
