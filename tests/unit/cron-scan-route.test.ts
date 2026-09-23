import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/cron-scan";

describe("scheduled scan endpoint", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("keeps source outcomes in operator logs and returns no diagnostics to callers", async () => {
    const fetchMock = vi.fn(async () => new Response("temporarily unavailable", { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "log").mockImplementation(() => undefined);

    const response = await handler();

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
