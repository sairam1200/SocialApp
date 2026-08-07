// src/features/auth/services/cookies.service.ts

import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@/constants/globals";

export const SESSION_COOKIE_NAME =
  COOKIE_NAMES.ACCESS_TOKEN;

export const REFRESH_COOKIE_NAME =
  COOKIE_NAMES.REFRESH_TOKEN;

/**
 * Server-side only.
 * Reads access token cookie set by NestJS.
 */
export async function getSessionCookie() {
  const cookieStore = await cookies();

  return (
    cookieStore.get(SESSION_COOKIE_NAME)
      ?.value ?? null
  );
}

/**
 * Server-side only.
 * Reads refresh token cookie set by NestJS.
 */
export async function getRefreshCookie() {
  const cookieStore = await cookies();

  return (
    cookieStore.get(REFRESH_COOKIE_NAME)
      ?.value ?? null
  );
}

/**
 * Server-side only.
 */
export async function hasSessionCookie() {
  const cookieStore = await cookies();

  return cookieStore.has(
    SESSION_COOKIE_NAME
  );
}

/**
 * Server-side only.
 */
export async function hasRefreshCookie() {
  const cookieStore = await cookies();

  return cookieStore.has(
    REFRESH_COOKIE_NAME
  );
  
  
}
// Client-side cookie management is handled by NestJS via Set-Cookie headers.
export async function setSessionCookie(
  value: string
) {
  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    value,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
    }
  );
}

export async function setRefreshCookie(
  value: string
) {
  const cookieStore = await cookies();

  cookieStore.set(
    REFRESH_COOKIE_NAME,
    value,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
    }
  );
}