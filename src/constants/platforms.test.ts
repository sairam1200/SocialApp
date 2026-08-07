import { describe, expect, it } from "vitest";
import { platformMap } from "./platforms";

describe("platform capability truth", () => {
  it("keeps LinkedIn identity OAuth available without advertising gated import", () => {
    expect(platformMap.linkedin.oauthStatus).toBe("ready");
    expect(platformMap.linkedin.capabilities.oauth).toBe(true);
    expect(platformMap.linkedin.capabilities.importContent).toBe(false);
  });

  it("keeps implemented Instagram import enabled", () => {
    expect(platformMap.instagram.capabilities.importContent).toBe(true);
  });
});
