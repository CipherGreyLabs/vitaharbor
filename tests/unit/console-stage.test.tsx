import React, { createRef } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConsoleStage, CONSOLE_3D_PREFERENCE_KEY } from "../../src/web/components/ledger/ConsoleStage";

vi.mock("../../src/web/components/3d/VitaConsoleScene", () => ({
  VitaConsoleScene: ({
    onRendererError,
    onRendererReady,
    reducedMotion,
    selectedProject
  }: {
    onRendererError?: (reason: "renderer-initialization") => void;
    onRendererReady?: () => void;
    reducedMotion?: boolean;
    selectedProject?: { display_name?: string } | null;
  }) => {
    React.useEffect(() => onRendererReady?.(), [onRendererReady]);
    return (
      <div data-testid="mock-vita" data-motion={reducedMotion ? "reduced" : "full"}>
        <span>{selectedProject?.display_name || "Vita"}</span>
        <button type="button" onClick={() => onRendererError?.("renderer-initialization")}>
          Force renderer error
        </button>
      </div>
    );
  }
}));

const firstProject = {
  id: 1,
  slug: "game-one",
  display_name: "Game One",
  game_title: "Game One",
  current_stage: "playable",
  original_platform: "PC"
};

const secondProject = {
  id: 2,
  slug: "game-two",
  display_name: "Game Two",
  game_title: "Game Two",
  current_stage: "released",
  original_platform: "PC"
};

let observerCallback: IntersectionObserverCallback | null = null;
class FakeIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) { observerCallback = callback; }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = "0px";
  thresholds = [0];
}

function setMedia(reduced = false) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  });
}

function setSaveData(saveData: boolean) {
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: { saveData, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  });
}

function makeProps(overrides: Partial<React.ComponentProps<typeof ConsoleStage>> = {}) {
  return {
    selectedProject: firstProject,
    projects: [firstProject, secondProject],
    selectedId: firstProject.id,
    onSelectProject: vi.fn(),
    webgl: true,
    onRetryWebgl: vi.fn(),
    onCopyLink: vi.fn(),
    copiedSlug: "",
    consoleRef: createRef<HTMLDivElement>(),
    ...overrides
  };
}

function intersectStage() {
  observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
}

describe("ConsoleStage mode and loading boundary", () => {
  beforeEach(() => {
    observerCallback = null;
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const values = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear()
      }
    });
    setMedia(false);
    setSaveData(false);
  });

  it("defers the 3D module until the stage approaches the viewport, then renders by default", async () => {
    render(<ConsoleStage {...makeProps()} />);
    expect(screen.getByTestId("console-stage").getAttribute("data-vita-mode")).toBe("3d");
    expect(screen.getByTestId("console-stage").getAttribute("data-vita-scene-state")).toBe("deferred");
    expect(screen.queryByTestId("mock-vita")).toBeNull();
    expect(observerCallback).not.toBeNull();

    act(() => intersectStage());
    expect(await screen.findByTestId("mock-vita")).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId("console-stage").getAttribute("data-vita-scene-state")).toBe("ready"));
  });

  it("keeps 3D under reduced motion and passes a reduced-motion setting to the scene", async () => {
    setMedia(true);
    render(<ConsoleStage {...makeProps()} />);
    const stage = screen.getByTestId("console-stage");
    expect(stage.getAttribute("data-vita-mode")).toBe("3d");
    expect(stage.getAttribute("data-reduced-motion")).toBe("true");
    act(() => intersectStage());
    await waitFor(() => expect(screen.getByTestId("mock-vita").getAttribute("data-motion")).toBe("reduced"));
    expect(screen.queryByTestId("static-vita-screen")).toBeNull();
  });

  it("starts static on save-data, persists a manual 3D override, and can switch back", async () => {
    setSaveData(true);
    render(<ConsoleStage {...makeProps()} />);
    expect(screen.getByTestId("console-stage").getAttribute("data-vita-fallback-reason")).toBe("save-data");
    fireEvent.click(screen.getByRole("button", { name: "Load 3D Vita" }));
    expect(await screen.findByTestId("mock-vita")).toBeTruthy();
    expect(window.localStorage.getItem(CONSOLE_3D_PREFERENCE_KEY)).toBe("3d");
    fireEvent.click(screen.getByRole("button", { name: "Use static preview" }));
    expect(screen.getByTestId("static-vita-screen")).toBeTruthy();
    expect(window.localStorage.getItem(CONSOLE_3D_PREFERENCE_KEY)).toBe("static");
  });

  it("keeps the ledger preview available when WebGL is unavailable and exposes retry", () => {
    const onRetryWebgl = vi.fn();
    render(<ConsoleStage {...makeProps({ webgl: false, onRetryWebgl })} />);
    expect(screen.getByTestId("console-stage").getAttribute("data-vita-fallback-reason")).toBe("webgl-unavailable");
    expect(screen.getByTestId("static-vita-screen")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry 3D Vita" }));
    expect(onRetryWebgl).toHaveBeenCalledOnce();
  });

  it("falls back after renderer failure and lets a retry mount the scene again", async () => {
    render(<ConsoleStage {...makeProps()} />);
    act(() => intersectStage());
    fireEvent.click(await screen.findByRole("button", { name: "Force renderer error" }));
    expect(screen.getByTestId("console-stage").getAttribute("data-vita-fallback-reason")).toBe("renderer-error");
    fireEvent.click(screen.getByRole("button", { name: "Retry 3D Vita" }));
    expect(await screen.findByTestId("mock-vita")).toBeTruthy();
  });

  it("updates the static Vita screen with project selection", async () => {
    const view = render(<ConsoleStage {...makeProps({ webgl: false })} />);
    expect(screen.getByTestId("static-vita-screen").getAttribute("aria-label")).toBe("Vita screen showing Game One");
    view.rerender(<ConsoleStage {...makeProps({ selectedProject: secondProject, selectedId: secondProject.id, webgl: false })} />);
    await waitFor(() => expect(screen.getByTestId("static-vita-screen").getAttribute("aria-label")).toBe("Vita screen showing Game Two"));
  });
});
