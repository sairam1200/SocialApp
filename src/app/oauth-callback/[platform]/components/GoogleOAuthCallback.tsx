"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { COOKIE_NAMES } from "@/constants/globals";
import toast from "react-hot-toast";
import { apiClient } from "@/services/apiClient.service";
import { setCookie } from "@/utils/cookie.util";
import { jwtDecode } from "jwt-decode";
import { rememberUserFromToken } from "@/utils/rememberedUsers.util";
import type { GoogleOAuthTokenResponseType } from "@/types/auth/login.type";

const DEFAULT_TOKEN_EXPIRY = 3600;
const REDIRECT_DELAY_SUCCESS = 1000;
const REDIRECT_DELAY_ERROR = 3000;

type CallbackStatus = "loading" | "success" | "error";

function calculateTokenExpiry(accessToken: string): number {
  try {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const decoded = jwtDecode<{ exp?: number }>(accessToken);
    return decoded.exp ? decoded.exp - nowInSeconds : DEFAULT_TOKEN_EXPIRY;
  } catch {
    return DEFAULT_TOKEN_EXPIRY;
  }
}

async function storeAuthTokens(
  accessToken: string,
  refreshToken?: string,
  refreshTokenExpiryTime?: number
): Promise<void> {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const accessTokenExpiry = calculateTokenExpiry(accessToken);

  let refreshTokenMaxAge: number | undefined;
  if (refreshToken && refreshTokenExpiryTime) {
    refreshTokenMaxAge = Math.max(refreshTokenExpiryTime - nowInSeconds, 0);
  }

  const accessTokenMaxAge = refreshTokenMaxAge ?? accessTokenExpiry;

  const cookiePromises = [
    setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      maxAge: accessTokenMaxAge,
    }),
  ];

  if (refreshToken && refreshTokenExpiryTime) {
    cookiePromises.push(
      setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
        maxAge: refreshTokenMaxAge,
      })
    );
  }

  await Promise.all(cookiePromises);
}

async function storePlatformTokens(
  googleResponse: GoogleOAuthTokenResponseType
): Promise<void> {
  if (googleResponse?.googleAccessToken) {
    const maxAge = googleResponse.googleAccessTokenExpiresIn || DEFAULT_TOKEN_EXPIRY;
    await setCookie(COOKIE_NAMES.GOOGLE_ACCESS_TOKEN, googleResponse.googleAccessToken, {
      maxAge,
    });
  }
}

async function handleAuthSuccess(
  response: GoogleOAuthTokenResponseType
): Promise<void> {
  await storeAuthTokens(
    response.access_token!,
    response.refresh_token,
    response.refreshTokenExpiryTime
  );

  await storePlatformTokens(response);

  rememberUserFromToken(response.access_token!);
}

function handleError(
  error: string,
  setStatus: (status: CallbackStatus) => void,
  setMessage: (message: string) => void,
  router: ReturnType<typeof useRouter>
): void {
  setStatus("error");
  setMessage(error);
  toast.error(error);

  setTimeout(() => {
    router.push("/login");
  }, REDIRECT_DELAY_ERROR);
}

function handleSuccess(
  setStatus: (status: CallbackStatus) => void,
  setMessage: (message: string) => void,
  router: ReturnType<typeof useRouter>
): void {
  setStatus("success");
  setMessage("Authentication successful!");
  toast.success("Authentication successful!");

  setTimeout(() => {
    router.push("/");
  }, REDIRECT_DELAY_SUCCESS);
}

export default function GoogleOAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("Processing authentication...");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    async function processCallback() {
      hasProcessed.current = true;

      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
          handleError(
            errorDescription || error || "Authentication failed",
            setStatus,
            setMessage,
            router
          );
          return;
        }

        if (!code || !state) {
          handleError(
            !code ? "Authorization code is missing" : "Authorization state is missing",
            setStatus,
            setMessage,
            router
          );
          return;
        }

        const redirectUrl =
          process.env.NODE_ENV !== "production" && typeof window !== "undefined"
            ? `${window.location.origin}/oauth-callback/google`
            : undefined;

        const result = await apiClient.Token.callbackAsync<GoogleOAuthTokenResponseType>(
          "google",
          code,
          state,
          redirectUrl
        );

        if (!result?.succeeded || !result.access_token) {
          handleError(
            result?.message || "Google authentication failed",
            setStatus,
            setMessage,
            router
          );
          return;
        }

        await handleAuthSuccess(result);
        handleSuccess(setStatus, setMessage, router);
      } catch (error) {
        console.error("Google OAuth callback error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "An unexpected error occurred";
        handleError(errorMessage, setStatus, setMessage, router);
      }
    }

    void processCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B42CEA] mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-lg text-gray-700">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-lg text-red-700">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
}
