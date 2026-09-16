import { describe, it, expect } from "vitest";
import {
  normalizeSlug,
  normalizeTitle,
  deriveActivityLevel,
  formatDate,
  formatRelativeTime,
  isWithinRetention,
  pageOffset
} from "../../src/shared/utils";

describe("Shared Utils", () => {
  describe("normalizeSlug", () => {
    it("should normalize titles into clean URL-safe slugs", () => {
      expect(normalizeSlug("Grand Theft Auto: San Andreas")).toBe("grand-theft-auto-san-andreas");
      expect(normalizeSlug("  Super Mario 64  ")).toBe("super-mario-64");
      expect(normalizeSlug("Fallout 1 & 2 [Port]")).toBe("fallout-1-2-port");
    });
  });

  describe("normalizeTitle", () => {
    it("should lowercase and trim title string", () => {
      expect(normalizeTitle("  Diablo II: Lord of Destruction  ")).toBe("diablo ii: lord of destruction");
    });
  });

  describe("deriveActivityLevel", () => {
    it("should correctly classify activity based on age in days", () => {
      const now = new Date();
      
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(deriveActivityLevel(twoDaysAgo)).toBe("hot");

      const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
      expect(deriveActivityLevel(twentyDaysAgo)).toBe("active");

      const fiftyDaysAgo = new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000);
      expect(deriveActivityLevel(fiftyDaysAgo)).toBe("quiet");

      const oneHundredDaysAgo = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000);
      expect(deriveActivityLevel(oneHundredDaysAgo)).toBe("dormant");

      const twoHundredDaysAgo = new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000);
      expect(deriveActivityLevel(twoHundredDaysAgo)).toBe("stale");
    });
  });

  describe("formatDate and formatRelativeTime", () => {
    it("should format date string as YYYY-MM-DD", () => {
      expect(formatDate(new Date("2026-03-15T12:00:00Z"))).toBe("2026-03-15");
    });

    it("should format relative times nicely", () => {
      const now = new Date();
      const thirtySecsAgo = new Date(now.getTime() - 30 * 1000);
      expect(formatRelativeTime(thirtySecsAgo)).toBe("just now");

      const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinsAgo)).toBe("5 minutes ago");
    });
  });

  describe("pageOffset", () => {
    it("should calculate correct 0-based offset", () => {
      expect(pageOffset(1, 20)).toBe(0);
      expect(pageOffset(2, 20)).toBe(20);
      expect(pageOffset(3, 10)).toBe(20);
    });
  });

  describe("isWithinRetention", () => {
    it("should check raw content TTL (48h)", () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

      expect(isWithinRetention(oneHourAgo)).toBe(true);
      expect(isWithinRetention(threeDaysAgo)).toBe(false);
    });
  });
});

