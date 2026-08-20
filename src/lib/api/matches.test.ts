import { afterEach, describe, expect, it, vi } from "vitest";

import { createMatch } from "@/test/fixtures";

import { getMatchDetails, getMatches } from "./matches";

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("matches API client", () => {
  it("returns validated matches from the same-origin proxy", async () => {
    const match = createMatch();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      success: true,
      data: { matches: [match], total: 1 },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getMatches()).resolves.toEqual([match]);
    expect(fetchMock).toHaveBeenCalledWith("/api/matches", expect.objectContaining({
      cache: "no-store",
      headers: { Accept: "application/json" },
    }));
  });

  it("preserves a service error and status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      error: { message: "Match not found" },
    }, 404)));

    const request = getMatchDetails("missing/match");
    await expect(request).rejects.toMatchObject({
      message: "Match not found",
      status: 404,
    });
  });

  it("rejects malformed successful responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      success: true,
      data: { matches: [{ id: "incomplete" }], total: 1 },
    })));

    await expect(getMatches()).rejects.toMatchObject({
      message: "The match service returned an unexpected response.",
      status: 502,
    });
  });
});
