import { describe, expect, it } from "vitest";
import { unwrapResponse } from "./wrapped-response.util";

describe("unwrapResponse", () => {
  it("unwraps successful array responses", () => {
    const rows = [{ id: "one" }];
    expect(unwrapResponse({ data: rows, success: true })).toBe(rows);
  });

  it("leaves unwrapped responses unchanged", () => {
    const rows = [{ id: "one" }];
    expect(unwrapResponse(rows)).toBe(rows);
  });
});
