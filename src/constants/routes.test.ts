import { describe, expect, it } from "vitest";
import { isProtectedPath } from "./routes";

describe("isProtectedPath", () => {
  it("protects private route segments and their children", () => {
    expect(isProtectedPath("/analytics")).toBe(true);
    expect(isProtectedPath("/collections/123")).toBe(true);
    expect(isProtectedPath("/community/messages/thread-1")).toBe(true);
  });

  it("does not classify public paths as protected", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/discover")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
  });
});
