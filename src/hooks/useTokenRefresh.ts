"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getIpAddress } from "@/utils/ipAddress.util";
import { checkTokenStatus, refreshTokenAction } from "@/actions/token.actions";
import { logoutFn } from "@/utils/logout.utitl";
import { PROTECTED_ROUTES } from "@/constants/routes";
import { getWebSocketService } from "@/services/websocket.service";
import { trackTokenRefresh, PerformanceTimer } from "@/utils/analytics.util";
import { getDeviceIdOrNull } from "@/utils/deviceId.util";

// Global state for token refresh coordination
let tokenRefreshCallback: (() => Promise<void>) | null = null;
let isRefreshingGlobally = false;
let refreshPromise: Promise<boolean> | null = null;
let refreshResolve: ((value: boolean) => void) | null = null;
let cachedIpAddress: string | null = null;
let ipAddressCacheTime = 0;
const IP_CACHE_DURATION = 60000; // Cache IP for 60 seconds

// Debounce concurrent refresh triggers
let lastRefreshTrigger = 0;
const REFRESH_DEBOUNCE = 500; // 500ms debounce

// Global mutex to prevent concurrent refresh attempts
const acquireRefreshLock = async (): Promise<(result: boolean) => void> => {
  if (isRefreshingGlobally && refreshPromise) {
    await refreshPromise;
  }

  isRefreshingGlobally = true;
  refreshPromise = new Promise<boolean>((resolve) => {
    refreshResolve = resolve;
  });

  return (result: boolean) => {
    isRefreshingGlobally = false;
    if (refreshResolve) {
      refreshResolve(result);
      refreshResolve = null;
    }
    refreshPromise = null;
  };
};

export function setTokenRefreshCallback(callback: (() => Promise<void>) | null): void {
  tokenRefreshCallback = callback;
}

export async function triggerTokenRefresh(): Promise<void> {
  if (tokenRefreshCallback) {
    await tokenRefreshCallback();
  }
}

export function isTokenRefreshInProgress(): boolean {
  return isRefreshingGlobally;
}

const TOKEN_REFRESH_THRESHOLD = 5 * 60;

// Cache IP address to avoid repeated fetches
const getCachedIpAddress = async (): Promise<string> => {
  const now = Date.now();
  if (cachedIpAddress && now - ipAddressCacheTime < IP_CACHE_DURATION) {
    return cachedIpAddress;
  }
  
  cachedIpAddress = await getIpAddress();
  ipAddressCacheTime = now;
  return cachedIpAddress;
};

const refreshToken = async (reason: 'expired' | 'expiring_soon' | 'header_trigger' | 'manual' = 'expiring_soon'): Promise<boolean> => {
  // Start performance timer
  const timer = new PerformanceTimer('token_refresh');
  
  // Debounce rapid refresh triggers
  const now = Date.now();
  if (now - lastRefreshTrigger < REFRESH_DEBOUNCE) {
    if (process.env.NODE_ENV === 'development') {
      console.log("[TokenRefresh] Debouncing rapid refresh trigger");
    }
    timer.end({ success: false, reason: 'debounced' });
    return false;
  }
  lastRefreshTrigger = now;

  // If already refreshing, wait for the existing refresh to complete
  if (isRefreshingGlobally && refreshPromise) {
    try {
      const result = await refreshPromise;
      timer.end({ success: result, reason: 'waited_for_existing' });
      return result;
    } catch {
      timer.end({ success: false, reason: 'existing_refresh_failed' });
      return false;
    }
  }

  const releaseLock = await acquireRefreshLock();
  const deviceId = getDeviceIdOrNull();

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("[TokenRefresh] Starting token refresh...");
    }

    if (!deviceId) {
      if (process.env.NODE_ENV === 'development') {
        console.error("[TokenRefresh] DeviceId is missing");
      }
      const duration = timer.end({ success: false, reason: 'no_device_id' });
      trackTokenRefresh({
        duration,
        success: false,
        reason,
        error: 'Device ID missing',
        deviceId: undefined,
      });
      releaseLock(false);
      return false;
    }

    // Use cached IP address
    const ipAddress = await getCachedIpAddress();

    const result = await refreshTokenAction({
      userAgent: navigator.userAgent,
      ipAddress,
      deviceId,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log("[TokenRefresh] Token refresh result:", result.success);
    }

    // Reconnect WebSocket with new token if refresh was successful
    if (result.success) {
      try {
        const wsService = getWebSocketService();
        wsService.reconnectAllWithNewToken();
        if (process.env.NODE_ENV === 'development') {
          console.log("[TokenRefresh] WebSocket reconnected with new token");
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("[TokenRefresh] Failed to reconnect WebSocket:", error);
        }
      }
    }

    const duration = timer.end({ success: result.success, reason });
    
    // Track refresh metrics
    trackTokenRefresh({
      duration,
      success: result.success,
      reason,
      error: result.success ? undefined : result.message,
      deviceId: deviceId || undefined,
    });

    releaseLock(result.success);
    return result.success;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("[TokenRefresh] Token refresh error:", error);
    }
    
    const duration = timer.end({ success: false, reason: 'exception' });
    trackTokenRefresh({
      duration,
      success: false,
      reason,
      error: error instanceof Error ? error.message : String(error),
      deviceId: deviceId || undefined,
    });
    
    releaseLock(false);
    return false;
  }
};

const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
};

export const useTokenRefresh = (skipInit: boolean = false) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shouldShowPreloader, setShouldShowPreloader] = useState(false);
  const [isInitialized, setIsInitialized] = useState(skipInit); // Initialize immediately if skipping
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkAndRefreshToken = useCallback(async (showPreloader = false): Promise<{ success: boolean; wasRefreshed: boolean }> => {
    if (process.env.NODE_ENV === 'development') {
      console.log("[TokenRefresh] Checking token status...");
    }
    
    const tokenStatus = await checkTokenStatus();
    
    if (process.env.NODE_ENV === 'development') {
      console.log("[TokenRefresh] Token status:", {
        hasToken: tokenStatus.hasToken,
        isExpired: tokenStatus.isExpired,
        isExpiringSoon: tokenStatus.isExpiringSoon,
        timeUntilExpiry: tokenStatus.timeUntilExpiry
      });
    }

    if (!tokenStatus.hasToken) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[TokenRefresh] No token found");
      }
      return { success: false, wasRefreshed: false };
    }

    const deviceId = getDeviceIdOrNull();
    if (!deviceId) {
      if (process.env.NODE_ENV === 'development') {
        console.log("DeviceId is missing but token exists. Session is invalid. Redirecting to login.");
      }
      const redirectPath = isProtectedRoute(pathname) ? `?redirect=${encodeURIComponent(pathname)}` : "";
      await logoutFn(getDeviceIdOrNull());
      router.push(`/login${redirectPath}`);
      return { success: false, wasRefreshed: false };
    }

    if (tokenStatus.isExpired || tokenStatus.isExpiringSoon) {
      if (showPreloader) setShouldShowPreloader(true);
      setIsRefreshing(true);

      const refreshReason = tokenStatus.isExpired ? 'expired' : 'expiring_soon';
      const success = await refreshToken(refreshReason);

      setIsRefreshing(false);
      if (showPreloader) setShouldShowPreloader(false);

      if (!success) {
        // Only check token status again if refresh failed
        const updatedTokenStatus = await checkTokenStatus();

        if (updatedTokenStatus.isExpired || !updatedTokenStatus.hasToken) {
          await logoutFn(getDeviceIdOrNull());
          if (isProtectedRoute(pathname)) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          } else {
            router.refresh();
          }
          return { success: false, wasRefreshed: false };
        }

        // Another refresh succeeded in parallel
        if (!updatedTokenStatus.isExpired && !updatedTokenStatus.isExpiringSoon) {
          return { success: true, wasRefreshed: true };
        }

        return { success: true, wasRefreshed: false };
      }

      if (success) {
        if (process.env.NODE_ENV === 'development') {
          console.log("[TokenRefresh] Token refreshed successfully, refreshing router...");
        }
        router.refresh();
      }

      return { success, wasRefreshed: true };
    }

    return { success: true, wasRefreshed: false };
  }, [router, pathname]);

  const scheduleTokenRefresh = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const tokenStatus = await checkTokenStatus();
    if (!tokenStatus.hasToken || !tokenStatus.timeUntilExpiry || tokenStatus.timeUntilExpiry <= 0) {
      return;
    }

    const timeUntilRefresh = Math.max(tokenStatus.timeUntilExpiry - TOKEN_REFRESH_THRESHOLD, 0);
    refreshTimerRef.current = setTimeout(() => {
      checkAndRefreshToken(false).then((result) => {
        if (result.success) {
          scheduleTokenRefresh();
        }
      });
    }, timeUntilRefresh * 1000);
  }, [checkAndRefreshToken]);

  useEffect(() => {
    // Skip initialization if on auth route
    if (skipInit) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[TokenRefresh] Skipping initialization on auth route");
      }
      return;
    }

    const initializeTokenRefresh = async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log("[TokenRefresh] Initializing token refresh...");
      }
      
      const result = await checkAndRefreshToken(true);

      if (result.wasRefreshed && result.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log("[TokenRefresh] Token was refreshed during initialization");
        }
        // Small delay to allow router refresh to complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await scheduleTokenRefresh();
      
      if (process.env.NODE_ENV === 'development') {
        console.log("[TokenRefresh] Initialization complete");
      }
      setIsInitialized(true);
    };

    initializeTokenRefresh();

    const refreshAndReschedule = async () => {
      const result = await checkAndRefreshToken(false);
      if (result.success) {
        await scheduleTokenRefresh();
      }
    };
    setTokenRefreshCallback(refreshAndReschedule);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      setTokenRefreshCallback(null);
      // Clear caches on unmount
      cachedIpAddress = null;
      ipAddressCacheTime = 0;
    };
  }, [checkAndRefreshToken, scheduleTokenRefresh, skipInit]);

  return {
    isRefreshing,
    shouldShowPreloader,
    isInitialized,
    checkAndRefreshToken,
  };
};