import { afterEach, describe, expect, it, vi } from "vitest";
import { getChildModeLabel, getMission, markCompletion } from "./api";

describe("api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws on missing mission instead of returning undefined item", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: "Not found" })
      })
    );

    await expect(getMission("missing-id")).rejects.toThrow("Mission not found");
  });

  it("posts mission completion payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rewardId: "reward-1" })
    });
    vi.stubGlobal("fetch", fetchMock);

    await markCompletion({ missionId: "mission-1", childMode: "age6" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/progress/completions",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ missionId: "mission-1", childMode: "age6" })
      })
    );
  });

  it("labels child modes for display", () => {
    expect(getChildModeLabel("age3")).toBe("3세");
    expect(getChildModeLabel("age6")).toBe("6세");
    expect(getChildModeLabel("together")).toBe("같이");
  });
});
