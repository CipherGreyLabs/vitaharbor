import React, { act, createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("../../src/web/components/3d/VitaConsoleScene", () => ({
  VitaConsoleScene: () => <div data-testid="three-scene">3D scene</div>
}));

import { ConsoleStage } from "../../src/web/components/ledger/ConsoleStage";

let observerCallback: IntersectionObserverCallback | null = null;

class FakeIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = "0px";
  thresholds = [0];
}

const project = {
  id: 1,
  slug: "example",
  game_title: "Example",
  display_name: "Example",
  current_stage: "playable"
};

describe("ConsoleStage deferred scene", () => {
  beforeEach(() => {
    observerCallback = null;
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("does not import the 3D scene until the console approaches the viewport", async () => {
    render(
      <ConsoleStage
        selectedProject={project as any}
        projects={[project]}
        selectedId={1}
        onSelectProject={() => undefined}
        webgl={true}
        onCopyLink={() => undefined}
        copiedSlug=""
        consoleRef={createRef<HTMLDivElement>()}
      />
    );

    expect(screen.queryByTestId("three-scene")).toBeNull();
    expect(observerCallback).not.toBeNull();

    await act(async () => {
      observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    expect(await screen.findByTestId("three-scene")).toBeTruthy();
  });

  it("uses the static console when reduced motion is requested", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));

    render(
      <ConsoleStage
        selectedProject={project as any}
        projects={[project]}
        selectedId={1}
        onSelectProject={() => undefined}
        webgl={true}
        onCopyLink={() => undefined}
        copiedSlug=""
        consoleRef={createRef<HTMLDivElement>()}
      />
    );

    expect(screen.getByTestId("static-vita-screen")).toBeTruthy();
    expect(screen.queryByTestId("three-scene")).toBeNull();
  });
});
