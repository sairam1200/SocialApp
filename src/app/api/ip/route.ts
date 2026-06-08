import { NextRequest } from "next/server";

/**
 * Returns the client's IP address from request headers.
 * Avoids ERR_BLOCKED_BY_CLIENT from ad blockers that block third-party IP APIs (ipify, ipinfo, etc).
 * The backend can read X-Forwarded-For, X-Real-IP, or similar set by the reverse proxy.
 */
export async function GET(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare

  const ip =
    cfConnectingIp?.split(",")[0]?.trim() ||
    forwarded?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    "0.0.0.0";

  return Response.json({ ip });
}
