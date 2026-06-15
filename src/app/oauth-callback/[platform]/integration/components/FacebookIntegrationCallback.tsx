"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/services/apiClient.service";
import { FacebookProfileType } from "@/types/account/profile.type";
import { COOKIE_NAMES } from "@/constants/globals";
import { setCookie } from "@/utils/cookie.util";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "@/types/jwtPayload.type";
type CallbackStatus = "loading" | "success" | "error";

const PLATFORM = "facebook";
const DEFAULT_TOKEN_EXPIRY = 3600;

export default function FacebookIntegrationCallback() {
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

      // Handle OAuth errors
      if (error) {
        setStatus("error");
        if (window.opener) {
          window.opener.dispatchEvent(
            new CustomEvent("oauth_failed", {
              detail: {
                platform: PLATFORM,
                error: errorDescription || error || "Facebook connection failed",
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

      const result = await apiClient.Integration.connectCallback<FacebookProfileType>(
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
                error: result.error ?? "Failed to connect Facebook account",
              },
            })
          );
          window.close();
        }
        return;
      }

      // Store platform-specific token
      if (result.accessToken) {
        const expiresIn = parseInt(result.expiresIn, 10) || DEFAULT_TOKEN_EXPIRY;
        await setCookie(COOKIE_NAMES.FACEBOOK_ACCESS_TOKEN, result.accessToken, {
          maxAge: expiresIn,
        });
      }

      // After storing the Facebook token

      setStatus("success");

      const draft = sessionStorage.getItem("onboarding_draft");

      if (draft) {
        const onboardingData = JSON.parse(draft);

        onboardingData.connectedAccounts = {
          ...(onboardingData.connectedAccounts ?? {}),
          facebook: "connected",
        };

        sessionStorage.setItem(
          "onboarding_draft",
          JSON.stringify(onboardingData)
        );
      }

      const token = localStorage.getItem("accessToken");
      let onboardingStep: string | undefined;

      if (token) {
        const payload = jwtDecode<JwtPayload>(token);
        onboardingStep = payload.onboardingStep;
        console.log(payload.onboardingStep);
      }

      setTimeout(() => {
        if (onboardingStep !== "Completed") {
          window.location.href =
            "/onboarding?provider=facebook&connected=true";
          return;
        }

        if (window.opener) {
          window.opener.location.reload();
          window.close();
        } else {
          window.location.href = "/discover";
        }
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
            <p className="text-lg text-gray-700">Connecting Facebook account…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-lg text-gray-700">Facebook connected successfully!</p>
            <p className="text-sm text-gray-500 mt-2">Closing window...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-lg text-red-700">Facebook connection failed</p>
            <p className="text-sm text-gray-500 mt-2">Closing window...</p>
          </>
        )}
      </div>
    </div>
  );
}
