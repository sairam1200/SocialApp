import { describe, expect, it } from "vitest";
import {
  isExternalResultUrl,
  isGaddrHost,
  isSafeResultUrl,
  normalizeContentStreamId,
  pinterestResultUrl,
} from "./result-url";

describe("result URL helpers", () => {
  it("treats Gaddr and its subdomains as first-party", () => {
    expect(isGaddrHost("gaddr.com")).toBe(true);
    expect(isGaddrHost("search.gaddr.com")).toBe(true);
    expect(isExternalResultUrl("https://accounts.gaddr.com/login")).toBe(false);
  });

  it("marks other web hosts as external", () => {
    expect(isExternalResultUrl("https://www.youtube.com/watch?v=abc")).toBe(true);
    expect(isExternalResultUrl("/profiles/alex")).toBe(false);
  });

  it("rejects executable and unsupported URL schemes", () => {
    expect(isSafeResultUrl("javascript:alert(document.domain)")).toBe(false);
    expect(isSafeResultUrl("data:text/html,hello")).toBe(false);
    expect(isSafeResultUrl("//evil.example/path")).toBe(false);
    expect(isSafeResultUrl("/profiles/alex")).toBe(true);
    expect(isSafeResultUrl("https://www.youtube.com/watch?v=abc")).toBe(true);
  });

  it("builds a canonical Pinterest pin URL instead of its outbound link", () => {
    expect(pinterestResultUrl("123456", "pin", {})).toBe(
      "https://www.pinterest.com/pin/123456/",
    );
    expect(
      pinterestResultUrl("123456", "pin", {
        permalink: "https://www.pinterest.com/pin/654321/",
      }),
    ).toBe("https://www.pinterest.com/pin/654321/");
  });

  it("normalizes content-stream UUIDs without forwarding composite result IDs", () => {
    const id = "70d06643-1ca6-4da3-8239-a5abef3a277d";
    expect(normalizeContentStreamId(id)).toBe(id);
    expect(normalizeContentStreamId(`youtube:content:${id}`)).toBe(id);
    expect(normalizeContentStreamId("gaddr-jobs:project:22")).toBeUndefined();
    expect(normalizeContentStreamId("not-a-uuid")).toBeUndefined();
  });
});
