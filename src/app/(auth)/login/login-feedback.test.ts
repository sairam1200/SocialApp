import { describe, expect, it } from "vitest";
import { LOGIN_SUCCESS_TOAST_DURATION_MS } from "./login-feedback";

describe("login feedback", () => {
  it("dismisses the success toast within the documented three-to-five-second window", () => {
    expect(LOGIN_SUCCESS_TOAST_DURATION_MS).toBeGreaterThanOrEqual(3_000);
    expect(LOGIN_SUCCESS_TOAST_DURATION_MS).toBeLessThanOrEqual(5_000);
  });
});
