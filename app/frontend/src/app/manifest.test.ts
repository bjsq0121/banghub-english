import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const publicDir = join(process.cwd(), "public");

function readManifest() {
  return JSON.parse(readFileSync(join(publicDir, "manifest.webmanifest"), "utf8")) as {
    start_url?: string;
    scope?: string;
    icons?: Array<{ src?: string; sizes?: string; type?: string; purpose?: string }>;
  };
}

describe("PWA manifest", () => {
  it("uses root-relative navigation and installable icons", () => {
    const manifest = readManifest();

    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/assets/app-icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any maskable"
        })
      ])
    );
    expect(existsSync(join(publicDir, "assets/app-icon.svg"))).toBe(true);
  });
});
