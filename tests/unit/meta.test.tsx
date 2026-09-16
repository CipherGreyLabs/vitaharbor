import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { applyDocumentMeta } from "../../src/web/lib/useDocumentMeta";
import App from "../../src/web/App";

describe("document metadata", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "";
  });

  it("suffixes the site name once", () => {
    const full = applyDocumentMeta({ title: "Port ledger" });

    expect(full).toBe("Port ledger — VitaHarbor");
    expect(document.title).toBe("Port ledger — VitaHarbor");
  });

  it("leaves a title that already names the site alone", () => {
    const full = applyDocumentMeta({ title: "VitaHarbor — Port ledger" });

    expect(full).toBe("VitaHarbor — Port ledger");
  });

  it("reuses description tags instead of stacking duplicates", () => {
    applyDocumentMeta({ title: "A", description: "first" });
    applyDocumentMeta({ title: "B", description: "second" });

    const descriptions = document.head.querySelectorAll('meta[name="description"]');
    expect(descriptions).toHaveLength(1);
    expect(descriptions[0]?.getAttribute("content")).toBe("second");
  });

  it("keeps the social title in sync", () => {
    applyDocumentMeta({ title: "Signal stream", description: "milestones" });

    expect(
      document.head.querySelector('meta[property="og:title"]')?.getAttribute("content")
    ).toBe("Signal stream — VitaHarbor");
  });

  it("applies a route-specific title when a page renders", () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <App />
      </MemoryRouter>
    );

    expect(document.title).toBe("About — VitaHarbor");
  });
});
