"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/services/apiClient.service";
import { YoutubeProfileType } from "@/types/account/profile.type";
import { COOKIE_NAMES } from "@/constants/globals";
import { setCookie } from "@/utils/cookie.util";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "@/types/jwtPayload.type";
type CallbackStatus = "loading" | "success" | "error";

const PLATFORM = "youtube";
const DEFAULT_TOKEN_EXPIRY = 3600;

const token = localStorage.getItem("accessToken");
let onboardingStep: string | undefined;
export default function YouTubeIntegrationCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    async function processCallback() {
      hasProcessed.current = true;

      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        setStatus("error");
        if (window.opener) {
          window.opener.dispatchEvent(
            new CustomEvent("oauth_failed", {
              detail: {
                platform: PLATFORM,
                error: errorDescription || error || "YouTube connection failed",
              },
            })
          );
          window.close();
        }
        return;
      }

      if (!code || !state) {
        setStatus("error");
        if (window.opener) {
          window.opener.dispatchEvent(
            new CustomEvent("oauth_failed", {
              detail: {
                platform: PLATFORM,
                error: !code
                  ? "Authorization code is missing"
                  : "Authorization state is missing",
              },
            })
          );
          window.close();
        }
        return;
      }

      const result = await apiClient.Integration.connectCallback<YoutubeProfileType>(
        PLATFORM,
        code,
        state
      );

      if (!result.success || !result.accessToken) {
        setStatus("error");
        if (window.opener) {
          window.opener.dispatchEvent(
            new CustomEvent("oauth_failed", {
              detail: {
                platform: PLATFORM,
                error: result.error ?? "Failed to connect YouTube account",
              },
            })
          );
          window.close();
        }
        return;
      }

      // Store platform-specific token (YouTube uses Google OAuth)
      if (result.accessToken) {
        const expiresIn = parseInt(result.expiresIn, 10) || DEFAULT_TOKEN_EXPIRY;
        await setCookie(COOKIE_NAMES.GOOGLE_ACCESS_TOKEN, result.accessToken, {
          maxAge: expiresIn,
        });
      }

      setStatus("success");

      const draft =
        sessionStorage.getItem("onboarding_draft");

      if (draft) {
        const onboardingData = JSON.parse(draft);

        onboardingData.connectedAccounts = {
          ...(onboardingData.connectedAccounts ?? {}),
          youtube: "connected",
        };

        sessionStorage.setItem(
          "onboarding_draft",
          JSON.stringify(onboardingData)
        );
      }

      if (token) {
        const payload = jwtDecode<JwtPayload>(token);
        onboardingStep = payload.onboardingStep;
        console.log(payload.onboardingStep);
      }

      setTimeout(() => {
        window.location.href =
          onboardingStep === "Completed"
            ? "/discover"
            : "/onboarding?provider=youtube&connected=true";
      }, 1000);
    }

    void processCallback();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B42CEA] mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Connecting YouTube account…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-lg text-gray-700">YouTube connected successfully!</p>
            <p className="text-sm text-gray-500 mt-2">Closing window...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-lg text-red-700">YouTube connection failed</p>
            <p className="text-sm text-gray-500 mt-2">Closing window...</p>
          </>
        )}
      </div>
    </div>
  );
}