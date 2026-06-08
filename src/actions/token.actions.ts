"use server";
import { jwtDecode } from "jwt-decode";
import { COOKIE_NAMES } from "@/constants/globals";
import { apiClient } from "@/services/apiClient.service";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookie.util";
import { PerformanceTimer } from "@/utils/analytics.util";

const DEFAULT_TOKEN_EXPIRY = 3600;
const TOKEN_CACHE_TTL = 1000; // Cache for 1 second to avoid redundant decoding

interface TokenStatus {
  hasToken: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  timeUntilExpiry: number | null;
}

// Token status cache to avoid redundant JWT decoding
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
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Check token error:", error);
    }
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
    // console.log("[refreshTokenAction] Fetching tokens from cookies...");
    const accessToken = await getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    const refreshTokenValue = await getCookie(COOKIE_NAMES.REFRESH_TOKEN);

    // console.log("[refreshTokenAction] Access token:", accessToken ? `${accessToken.substring(0, 20)}...` : "null");
    // console.log("[refreshTokenAction] Refresh token:", refreshTokenValue ? `${refreshTokenValue.substring(0, 20)}...` : "null");

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

    const response = await apiClient.Token.refreshTokenAsync({
      refreshToken: refreshTokenValue,
      userAgent,
      ipAddress,
      deviceId,
    });

    if (!response.succeeded || !response.access_token) {
      timer.end({ success: false, reason: 'api_failed' });
      return {
        success: false,
        message: response.message || "Token refresh failed",
      };
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const decoded = jwtDecode<{ exp?: number }>(response.access_token);
    const accessTokenExpiry = decoded.exp
      ? decoded.exp - nowInSeconds
      : DEFAULT_TOKEN_EXPIRY;

    let refreshTokenMaxAge: number | undefined;
    if (response.refreshTokenExpiryTime) {
      refreshTokenMaxAge = Math.max(
        response.refreshTokenExpiryTime - nowInSeconds,
        0
      );
    }

    const accessTokenMaxAge = refreshTokenMaxAge ?? accessTokenExpiry;

    try {
      await setCookie(COOKIE_NAMES.ACCESS_TOKEN, response.access_token, {
        maxAge: accessTokenMaxAge,
      });

      if (response.refresh_token) {
        // console.log("[refreshTokenAction] Saving new refresh token with maxAge:", refreshTokenMaxAge);
        await setCookie(COOKIE_NAMES.REFRESH_TOKEN, response.refresh_token, {
          maxAge: refreshTokenMaxAge,
        });
      }

      // Clear cache after successful token refresh
      clearTokenCache();
    } catch (cookieError) {
      if (process.env.NODE_ENV === 'development') {
        console.error("[refreshTokenAction] Failed to set cookies:", cookieError);
      }
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