import { afterEach, describe, expect, it, vi } from "vitest";
import { getContentItem } from "./api";

describe("getContentItem", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws on missing content instead of returning undefined item", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: "Not found" })
      })
    );

    await expect(getContentItem("conversation", "missing-id")).rejects.toThrow("Content not found");
  });
});
