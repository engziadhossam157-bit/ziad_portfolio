import { describe, expect, it } from "vitest";
import { safeNextPath } from "@shared/const";

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/portal")).toBe("/portal");
    expect(safeNextPath("/projects/monthly-tracker?tab=1#top")).toBe("/projects/monthly-tracker?tab=1#top");
  });

  it("rejects anything that could leave the site", () => {
    // Browsers treat "/\host" and "/<tab>/host" like "//host", so those must be rejected too.
    for (const bad of [null, "", "portal", "https://evil.example", "//evil.example", "/\\evil.example", "/\t/evil.example", "javascript:alert(1)"]) {
      expect(safeNextPath(bad)).toBeNull();
    }
  });
});
