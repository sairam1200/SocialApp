import { describe, expect, it } from "vitest";
import { isTurnstileConfigurationSafe } from "./turnstile.util";

describe("isTurnstileConfigurationSafe", () => {
  it("rejects Cloudflare test keys in production", () => {
    expect(
      isTurnstileConfigurationSafe("1x00000000000000000000AA", "production"),
    ).toBe(false);
  });

  it("allows Cloudflare test keys in production when explicitly enabled", () => {
    expect(
      isTurnstileConfigurationSafe(
        "1x00000000000000000000AA",
        "production",
        true,
      ),
    ).toBe(true);
  });

  it("allows a configured live key in production", () => {
    expect(isTurnstileConfigurationSafe("live-site-key", "production")).toBe(
      true,
    );
  });

  it("allows a test key outside production", () => {
    expect(
      isTurnstileConfigurationSafe("1x00000000000000000000AA", "test"),
    ).toBe(true);
  });
});
