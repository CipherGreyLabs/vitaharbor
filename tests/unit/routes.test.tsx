import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/web/App";
import { FALLBACK_PROJECTS, FALLBACK_UPDATES } from "../../src/shared/constants/fallbackData";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("public routes", () => {
  it("renders a real project detail route from bundled data", async () => {
    const project = FALLBACK_PROJECTS[0];
    render(
      <MemoryRouter initialEntries={[`/projects/${project.slug}/`]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 1, name: project.game_title })).toBeTruthy();
    expect(screen.getByText("[ Back to Directory ]")).toBeTruthy();
  });

  it("renders the chronological updates route", () => {
    render(
      <MemoryRouter initialEntries={["/updates/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "All updates" })).toBeTruthy();
    expect(document.querySelectorAll("ol > li")).toHaveLength(FALLBACK_UPDATES.length);
  });

  it("renders only the public discovery projection fields", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        generated_at: "2026-09-22T21:50:30.064Z",
        source: "Reddit RSS",
        items: [{
          id: "reddit-example",
          state: "VERIFIED_FOR_REVIEW",
          title: "Example Vita port thread",
          url: "https://www.reddit.com/r/vitahacks/comments/example/",
          subreddit: "vitahacks",
          published_at: "2026-09-22T20:00:00.000Z",
          candidate_type: "port",
          author: "must-not-render",
          risk_signals: ["must-not-render"]
        }]
      })
    }));

    render(
      <MemoryRouter initialEntries={["/discovery/"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("Example Vita port thread")).toBeTruthy();
    expect(document.body.textContent).not.toContain("must-not-render");
    expect(screen.getByText("Reddit RSS")).toBeTruthy();
  });
});
