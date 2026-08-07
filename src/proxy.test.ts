import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { config, proxy } from "./proxy";

function tokenExpiringAt(exp: number): string {
  const payload = btoa(JSON.stringify({ exp }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `header.${payload}.signature`;
}

describe("session proxy", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("allows protected navigation without deleting cookies during a backend outage", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    const token = tokenExpiringAt(Math.floor(Date.now() / 1000) + 3600);
    const request = new NextRequest("http://localhost/settings", {
      headers: { cookie: `access_token=${token}` },
    });

    const response = await proxy(request);
    expect(response.status).toBe(200);
    expect(response.cookies.get("access_token")).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("redirects a missing session from a protected route", async () => {
    const response = await proxy(new NextRequest("http://localhost/analytics"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?redirect=%2Fanalytics");
  });

  it("matches every protected route family", () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining([
        "/settings/:path*",
        "/analytics/:path*",
        "/bookmarks/:path*",
        "/collections/:path*",
        "/admin/:path*",
        "/community/messages/:path*",
      ]),
    );
  });
});
