import { beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_NAMES } from "@/constants/globals";

const { cookieStore } = vi.hoisted(() => ({
  cookieStore: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import { logoutFn } from "./logout.utitl";

describe("logoutFn", () => {
  beforeEach(() => {
    cookieStore.get.mockReset();
    cookieStore.delete.mockReset();
    vi.restoreAllMocks();
  });

  it("clears session and provider cookies when the backend is unavailable", async () => {
    cookieStore.get.mockReturnValue({ value: "gaddr-access-token" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(logoutFn("device-id")).resolves.toEqual({ success: false });

    const deleted = cookieStore.delete.mock.calls.map(([name]) => name);
    expect(deleted).toContain(COOKIE_NAMES.ACCESS_TOKEN);
    expect(deleted).toContain(COOKIE_NAMES.REFRESH_TOKEN);
    expect(deleted).toContain(COOKIE_NAMES.GOOGLE_ACCESS_TOKEN);
    expect(deleted).toContain(COOKIE_NAMES.TIKTOK_ACCESS_TOKEN);
    expect(deleted).toContain("__Secure-better-auth.session_token");
  });
});
