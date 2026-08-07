import { describe, expect, it } from "vitest";
import { platformMap } from "./platforms";

describe("platform capability truth", () => {
  it("keeps LinkedIn organization-post import available", () => {
    expect(platformMap.linkedin.oauthStatus).toBe("ready");
    expect(platformMap.linkedin.capabilities.oauth).toBe(true);
    expect(platformMap.linkedin.capabilities.importContent).toBe(true);
  });

  it("keeps implemented Instagram import enabled", () => {
    expect(platformMap.instagram.capabilities.importContent).toBe(true);
  });
});
