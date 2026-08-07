import { beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_NAMES } from "@/constants/globals";

const { deleteCookie, setCookie, getCookie } = vi.hoisted(() => ({
  deleteCookie: vi.fn(),
  setCookie: vi.fn(),
  getCookie: vi.fn(),
}));

vi.mock("@/utils/cookie.util", () => ({ deleteCookie, setCookie, getCookie }));
vi.mock("@/utils/analytics.util", () => ({
  PerformanceTimer: class {
    end() {
      return 0;
    }
  },
}));

import {
  integrationOAuthCallbackAction,
  clearLegacyProviderTokenCookiesAction,
  loginAction,
  refreshTokenAction,
} from "./token.actions";

function unsignedToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString("base64url");
  return `header.${payload}.signature`;
}

describe("auth server actions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setCookie.mockReset();
    getCookie.mockReset();
    deleteCookie.mockReset();
  });

  it("stores login tokens only in httpOnly cookies and returns no token", async () => {
    const accessToken = unsignedToken();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            succeeded: true,
            access_token: accessToken,
            refresh_token: "refresh-secret",
            refreshTokenExpiryTime: Math.floor(Date.now() / 1000) + 7200,
            onboardingCompleted: true,
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const result = await loginAction({
      email: "person@example.com",
      password: "correct horse battery staple",
      deviceId: "device-1",
      userAgent: "Browser/1.0",
      ipAddress: "127.0.0.1",
      turnstileToken: "turnstile-token",
    });

    expect(result).toEqual({ succeeded: true, onboardingCompleted: true });
    expect(JSON.stringify(result)).not.toContain(accessToken);
    expect(setCookie).toHaveBeenCalledWith(
      COOKIE_NAMES.ACCESS_TOKEN,
      accessToken,
      expect.objectContaining({ httpOnly: true }),
    );
    expect(setCookie).toHaveBeenCalledWith(
      COOKIE_NAMES.REFRESH_TOKEN,
      "refresh-secret",
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("authenticates refresh directly with the expired access cookie", async () => {
    const refreshedAccessToken = unsignedToken();
    getCookie.mockImplementation(async (name: string) =>
      name === COOKIE_NAMES.ACCESS_TOKEN ? "expired-signed-token" : "refresh-secret",
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          succeeded: true,
          access_token: refreshedAccessToken,
          refresh_token: "rotated-refresh",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await refreshTokenAction({
      deviceId: "device-1",
      userAgent: "Browser/1.0",
      ipAddress: "127.0.0.1",
    });

    expect(result.success).toBe(true);
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual(
      expect.objectContaining({ Authorization: "Bearer expired-signed-token" }),
    );
    expect(JSON.stringify(result)).not.toContain(refreshedAccessToken);
  });

  it("accepts an opaque integration callback without persisting provider tokens", async () => {
    getCookie.mockImplementation(async (name: string) =>
      name === COOKIE_NAMES.ACCESS_TOKEN ? undefined : "legacy-token",
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ succeeded: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await integrationOAuthCallbackAction({
      platform: "youtube",
      code: "authorization-code",
      state: "one-time-state",
    });

    expect(result).toEqual({ success: true, onboardingCompleted: undefined });
    expect(setCookie).not.toHaveBeenCalled();
    expect(deleteCookie).toHaveBeenCalledTimes(7);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("treats a persisted connection as success when the callback response fails", async () => {
    getCookie.mockImplementation(async (name: string) =>
      name === COOKIE_NAMES.ACCESS_TOKEN ? "session-token" : undefined,
    );
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "import response failed" }), {
          status: 502,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ platforms: ["pinterest"] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await integrationOAuthCallbackAction({
      platform: "pinterest",
      code: "authorization-code",
      state: "one-time-state",
    });

    expect(result).toEqual({ success: true, onboardingCompleted: undefined });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1]?.headers).toEqual(
      expect.objectContaining({ Authorization: "Bearer session-token" }),
    );
  });

  it("removes all legacy provider-token cookies", async () => {
    getCookie.mockResolvedValue("legacy-token");

    await clearLegacyProviderTokenCookiesAction();

    expect(deleteCookie.mock.calls.map(([name]) => name)).toEqual([
      COOKIE_NAMES.GOOGLE_ACCESS_TOKEN,
      COOKIE_NAMES.FACEBOOK_ACCESS_TOKEN,
      COOKIE_NAMES.INSTAGRAM_ACCESS_TOKEN,
      COOKIE_NAMES.TWITTER_ACCESS_TOKEN,
      COOKIE_NAMES.PINTEREST_ACCESS_TOKEN,
      COOKIE_NAMES.LINKEDIN_ACCESS_TOKEN,
      COOKIE_NAMES.TIKTOK_ACCESS_TOKEN,
    ]);
  });

  it("does not mutate the response when no legacy provider cookies exist", async () => {
    getCookie.mockResolvedValue(undefined);

    await clearLegacyProviderTokenCookiesAction();

    expect(deleteCookie).not.toHaveBeenCalled();
  });
});
