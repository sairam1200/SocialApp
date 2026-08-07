import { describe, expect, it } from "vitest";
import { getAnalyticsErrorKind } from "./analytics-ui.util";

describe("getAnalyticsErrorKind", () => {
  it("maps provider permission rejection without exposing provider copy", () => {
    expect(
      getAnalyticsErrorKind({
        response: {
          status: 403,
          data: { message: "private provider diagnostic" },
        },
      }),
    ).toBe("permissionDenied");
  });

  it("asks for reconnection when the provider credential is no longer valid", () => {
    expect(getAnalyticsErrorKind({ response: { status: 401, data: {} } })).toBe(
      "permissionRequired",
    );
  });

  it("keeps unrelated failures generic", () => {
    expect(getAnalyticsErrorKind(new Error("database internals"))).toBe(
      "loadFailed",
    );
  });
});
