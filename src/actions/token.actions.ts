"use server";
import { jwtDecode } from "jwt-decode";
import { COOKIE_NAMES } from "@/constants/globals";
import { deleteCookie, setCookie, getCookie } from "@/utils/cookie.util";
import { PerformanceTimer } from "@/utils/analytics.util";
import type { TokenResponseType } from "@/types/auth/login.type";

const DEFAULT_TOKEN_EXPIRY = 3600;
const TOKEN_CACHE_TTL = 1000;
const TWO_FACTOR_CHALLENGE_COOKIE = "two_factor_challenge";
const LEGACY_PROVIDER_TOKEN_COOKIE_NAMES = [
  COOKIE_NAMES.GOOGLE_ACCESS_TOKEN,
  COOKIE_NAMES.FACEBOOK_ACCESS_TOKEN,
  COOKIE_NAMES.INSTAGRAM_ACCESS_TOKEN,
  COOKIE_NAMES.TWITTER_ACCESS_TOKEN,
  COOKIE_NAMES.PINTEREST_ACCESS_TOKEN,
  COOKIE_NAMES.LINKEDIN_ACCESS_TOKEN,
  COOKIE_NAMES.TIKTOK_ACCESS_TOKEN,
] as const;

function backendUrl(path: string): string {
  const origin = (process.env.AUTH_API_URL || "http://localhost:8080").replace(
    /\/$/,
    "",
  );
  return `${origin}/api/v1${path}`;
}

function accessTokenMaxAge(accessToken: string): number {
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = jwtDecode<{ exp?: number }>(accessToken).exp;
    return expiresAt ? Math.max(expiresAt - now, 0) : DEFAULT_TOKEN_EXPIRY;
  } catch {
    return DEFAULT_TOKEN_EXPIRY;
  }
}

async function persistSession(response: TokenResponseType): Promise<void> {
  if (!response.access_token) throw new Error("Missing access token");

  await setCookie(COOKIE_NAMES.ACCESS_TOKEN, response.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: accessTokenMaxAge(response.access_token),
  });

  if (response.refresh_token) {
    const now = Math.floor(Date.now() / 1000);
    const maxAge = response.refreshTokenExpiryTime
      ? Math.max(response.refreshTokenExpiryTime - now, 0)
      : undefined;
    await setCookie(COOKIE_NAMES.REFRESH_TOKEN, response.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
    });
  }

  tokenStatusCache = null;
}

async function readTokenResponse(response: Response): Promise<TokenResponseType> {
  const body = (await response.json().catch(() => ({}))) as TokenResponseType;
  if (!response.ok) {
    return { ...body, succeeded: false } as TokenResponseType;
  }
  return body;
}

export interface LoginActionParams {
  email: string;
  password: string;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  turnstileToken: string;
}

export interface LoginActionResult {
  succeeded: boolean;
  message?: string;
  isTwoFARequired?: boolean;
  isDeactivated?: boolean;
  onboardingCompleted?: boolean;
}

export async function loginAction(
  params: LoginActionParams,
): Promise<LoginActionResult> {
  try {
    const response = await fetch(backendUrl("/auth/access-token"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": params.userAgent,
        "x-turnstile-token": params.turnstileToken,
      },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        deviceId: params.deviceId,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
      }),
      cache: "no-store",
    });
    const result = await readTokenResponse(response);

    if (result.isTwoFARequired && result.access_token) {
      await setCookie(TWO_FACTOR_CHALLENGE_COOKIE, result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 10 * 60,
      });
      return { succeeded: false, isTwoFARequired: true };
    }

    if (!result.succeeded || !result.access_token) {
      return {
        succeeded: false,
        isDeactivated: result.isDeactivated,
        message: result.message,
      };
    }

    await persistSession(result);
    return {
      succeeded: true,
      onboardingCompleted: result.onboardingCompleted,
    };
  } catch {
    return { succeeded: false };
  }
}

export interface VerifyTwoFactorParams {
  userOTP: string;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
}

export async function verifyTwoFactorAction(
  params: VerifyTwoFactorParams,
): Promise<LoginActionResult> {
  try {
    const challenge = await getCookie(TWO_FACTOR_CHALLENGE_COOKIE);
    if (!challenge) return { succeeded: false };

    const response = await fetch(backendUrl("/account/2fa/verify"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${challenge}`,
      },
      body: JSON.stringify(params),
      cache: "no-store",
    });
    const result = await readTokenResponse(response);
    if (!result.succeeded || !result.access_token) {
      return { succeeded: false, isTwoFARequired: true };
    }

    await persistSession(result);
    const currentResponse = await fetch(backendUrl("/auth/current"), {
      headers: { Authorization: `Bearer ${result.access_token}` },
      cache: "no-store",
    });
    const current = (await currentResponse.json().catch(() => ({}))) as {
      onboardingCompleted?: boolean;
    };

    const { cookies } = await import("next/headers");
    (await cookies()).delete(TWO_FACTOR_CHALLENGE_COOKIE);
    return {
      succeeded: true,
      onboardingCompleted: current.onboardingCompleted,
    };
  } catch {
    return { succeeded: false, isTwoFARequired: true };
  }
}

export async function oauthCallbackAction(params: {
  platform: "google" | "facebook";
  code: string;
  state: string;
  redirectUrl?: string;
}): Promise<LoginActionResult> {
  try {
    const url = new URL(backendUrl(`/auth/${params.platform}/connect-callback`));
    url.searchParams.set("code", params.code);
    url.searchParams.set("state", params.state);
    const response = await fetch(url, {
      headers: params.redirectUrl
        ? { "x-redirect-url": params.redirectUrl }
        : undefined,
      cache: "no-store",
    });
    const result = await readTokenResponse(response);
    if (!result.succeeded || !result.access_token) {
      return { succeeded: false, message: result.message };
    }

    await persistSession(result);
    return {
      succeeded: true,
      onboardingCompleted: result.onboardingCompleted,
    };
  } catch {
    return { succeeded: false };
  }
}

export type IntegrationPlatform =
  | "youtube"
  | "facebook"
  | "instagram"
  | "twitter"
  | "pinterest"
  | "linkedin"
  | "tiktok";

export interface IntegrationOAuthCallbackResult {
  success: boolean;
  error?: string;
  onboardingCompleted?: boolean;
}

/** Remove provider bearer cookies written by pre-migration frontends. */
export async function clearLegacyProviderTokenCookiesAction(): Promise<void> {
  const presentCookies = (
    await Promise.all(
      LEGACY_PROVIDER_TOKEN_COOKIE_NAMES.map(async (name) =>
        (await getCookie(name)) ? name : null,
      ),
    )
  ).filter(
    (name): name is (typeof LEGACY_PROVIDER_TOKEN_COOKIE_NAMES)[number] =>
      name !== null,
  );

  await Promise.all(presentCookies.map((name) => deleteCookie(name)));
}

export async function integrationOAuthCallbackAction(params: {
  platform: IntegrationPlatform;
  code: string;
  state: string;
}): Promise<IntegrationOAuthCallbackResult> {
  try {
    const url = new URL(
      backendUrl(`/integrations/${params.platform}/connect-callback`),
    );
    url.searchParams.set("code", params.code);
    url.searchParams.set("state", params.state);

    const accessToken = await getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    const response = await fetch(url, {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
      cache: "no-store",
    });
    const result = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      succeeded?: boolean;
      error?: string;
      message?: string;
    };

    if (!response.ok || (!result.success && !result.succeeded)) {
      // The provider callback can persist the linked account and enqueue its
      // import before a later response/worker step fails. Verify the durable
      // connection state before surfacing a false failure to the user.
      if (accessToken) {
        try {
          const linkedResponse = await fetch(
            backendUrl("/integrations/me/linked-accounts"),
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              cache: "no-store",
            },
          );
          const linked = (await linkedResponse.json().catch(() => ({}))) as {
            platforms?: unknown;
          };
          const platforms = Array.isArray(linked.platforms)
            ? linked.platforms.map((platform) => String(platform).toLowerCase())
            : [];
          if (linkedResponse.ok && platforms.includes(params.platform.toLowerCase())) {
            await clearLegacyProviderTokenCookiesAction();
            return { success: true, onboardingCompleted: undefined };
          }
        } catch {
          // Preserve the original callback error when verification is unavailable.
        }
      }
      return {
        success: false,
        error: result.error || result.message || "Account connection failed",
      };
    }

    await clearLegacyProviderTokenCookiesAction();

    let onboardingCompleted: boolean | undefined;
    if (accessToken) {
      const currentResponse = await fetch(backendUrl("/auth/current"), {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (currentResponse.ok) {
        const current = (await currentResponse.json().catch(() => ({}))) as {
          onboardingCompleted?: boolean;
        };
        onboardingCompleted = current.onboardingCompleted;
      }
    }

    return { success: true, onboardingCompleted };
  } catch {
    return { success: false, error: "Account connection failed" };
  }
}

export async function completeOnboardingAction(): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const accessToken = await getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    if (!accessToken) return { success: false, message: "Session is missing" };

    const response = await fetch(backendUrl("/onboarding/step4"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ confirmed: true }),
      cache: "no-store",
    });
    const result = (await response.json().catch(() => ({}))) as {
      isCompleted?: boolean;
      accessToken?: string;
      message?: string;
    };
    if (!response.ok || result.isCompleted === false) {
      return {
        success: false,
        message: result.message || "Failed to complete onboarding",
      };
    }

    if (result.accessToken) {
      await persistSession({
        success: true,
        succeeded: true,
        message: "",
        access_token: result.accessToken,
        isLockedOut: false,
        isTwoFARequired: false,
      });
    }
    return { success: true };
  } catch {
    return { success: false, message: "Failed to complete onboarding" };
  }
}

interface TokenStatus {
  hasToken: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  timeUntilExpiry: number | null;
}

// ponytail: Server-only cache (module scope is safe because this file has "use server"
// and is never bundled to the client). WeakMap would work but a simple variable
// is sufficient here since it's keyed by the token string anyway.
let tokenStatusCache: { status: TokenStatus; timestamp: number; token: string } | null = null;

export async function checkTokenStatus(): Promise<TokenStatus> {
  try {
    const accessToken = await getCookie(COOKIE_NAMES.ACCESS_TOKEN);

    if (!accessToken) {
      tokenStatusCache = null; // Clear cache if no token
      return {
        hasToken: false,
        isExpired: true,
        isExpiringSoon: true,
        timeUntilExpiry: null,
      };
    }

    // Return cached status if token hasn't changed and cache is fresh
    const now = Date.now();
    if (tokenStatusCache &&
      tokenStatusCache.token === accessToken &&
      now - tokenStatusCache.timestamp < TOKEN_CACHE_TTL) {
      return tokenStatusCache.status;
    }

    try {
      const decoded = jwtDecode<{ exp?: number }>(accessToken);
      const nowInSeconds = Math.floor(now / 1000);

      if (!decoded.exp) {
        const status = {
          hasToken: true,
          isExpired: true,
          isExpiringSoon: true,
          timeUntilExpiry: null,
        };
        tokenStatusCache = { status, timestamp: now, token: accessToken };
        return status;
      }

      const timeUntilExpiry = decoded.exp - nowInSeconds;
      const isExpired = timeUntilExpiry <= 0;
      const isExpiringSoon = timeUntilExpiry <= 5 * 60;

      const status = {
        hasToken: true,
        isExpired,
        isExpiringSoon,
        timeUntilExpiry: isExpired ? 0 : timeUntilExpiry,
      };

      tokenStatusCache = { status, timestamp: now, token: accessToken };
      return status;
    } catch {
      const status = {
        hasToken: true,
        isExpired: true,
        isExpiringSoon: true,
        timeUntilExpiry: null,
      };
      tokenStatusCache = null; // Don't cache invalid tokens
      return status;
    }
  } catch {
    tokenStatusCache = null;
    return {
      hasToken: false,
      isExpired: true,
      isExpiringSoon: true,
      timeUntilExpiry: null,
    };
  }
}

// Clear token cache when tokens are updated
export async function clearTokenCache(): Promise<void> {
  tokenStatusCache = null;
}

export interface RefreshTokenParams {
  userAgent: string;
  ipAddress: string;
  deviceId: string;
}

export interface RefreshTokenResult {
  success: boolean;
  message?: string;
}

export async function refreshTokenAction(
  params: RefreshTokenParams
): Promise<RefreshTokenResult> {
  const timer = new PerformanceTimer('refresh_token_action');

  try {
    const accessToken = await getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    const refreshTokenValue = await getCookie(COOKIE_NAMES.REFRESH_TOKEN);

    if (!accessToken || !refreshTokenValue) {
      timer.end({ success: false, reason: 'no_tokens' });
      return {
        success: false,
        message: "No tokens found",
      };
    }

    const { userAgent, ipAddress, deviceId } = params;
    if (!userAgent || !ipAddress || !deviceId) {
      timer.end({ success: false, reason: 'missing_params' });
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    const backendResponse = await fetch(backendUrl("/auth/refresh-access-token"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Cookie: `${COOKIE_NAMES.ACCESS_TOKEN}=${encodeURIComponent(accessToken)}; ${COOKIE_NAMES.REFRESH_TOKEN}=${encodeURIComponent(refreshTokenValue)}`,
      },
      body: JSON.stringify({
        refreshToken: refreshTokenValue,
        userAgent,
        ipAddress,
        deviceId,
      }),
      cache: "no-store",
    });
    const response = await readTokenResponse(backendResponse);

    if (!response.succeeded || !response.access_token) {
      timer.end({ success: false, reason: 'api_failed' });
      if (backendResponse.status === 401 || backendResponse.status === 403) {
        const { clearLocalSessionFn } = await import("@/utils/logout.utitl");
        await clearLocalSessionFn();
      }
      return {
        success: false,
        message: response.message || "Token refresh failed",
      };
    }

    try {
      await persistSession(response);
    } catch {
      timer.end({ success: false, reason: 'cookie_save_failed' });
      return {
        success: false,
        message: "Failed to save tokens",
      };
    }

    timer.end({ success: true });
    return {
      success: true,
      message: "Token refreshed successfully",
    };
  } catch (error) {
    timer.end({ success: false, reason: 'exception', error: String(error) });
    return {
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    };
  }
}
