"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/services/apiClient.service";
import { InstagramProfileType } from "@/types/account/profile.type";
import { COOKIE_NAMES } from "@/constants/globals";
import { setCookie } from "@/utils/cookie.util";

type CallbackStatus = "loading" | "success" | "error";

const PLATFORM = "instagram";
const DEFAULT_TOKEN_EXPIRY = 3600;

export default function InstagramIntegrationCallback() {
  const searchParams = useSearchParams();

  const [status, setStatus] =
    useState<CallbackStatus>("loading");

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
      const errorDescription =
        searchParams.get("error_description");

      if (error) {
        setStatus("error");

        if (window.opener) {
          window.opener.dispatchEvent(
            new CustomEvent("oauth_failed", {
              detail: {
                platform: PLATFORM,
                error:
                  errorDescription ??
                  error ??
                  "Instagram connection failed",
              },
            }),
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
            }),
          );

          window.close();
        }

        return;
      }

      const result =
        await apiClient.Integration.connectCallback<InstagramProfileType>(
          PLATFORM,
          code,
          state,
        );

      if (
        !result.success ||
        !result.accessToken
      ) {
        setStatus("error");

        if (window.opener) {
          window.opener.dispatchEvent(
            new CustomEvent("oauth_failed", {
              detail: {
                platform: PLATFORM,
                error:
                  result.error ??
                  "Failed to connect Instagram account",
              },
            }),
          );

          window.close();
        }

        return;
      }

      const expiresIn =
        parseInt(result.expiresIn, 10) ||
        DEFAULT_TOKEN_EXPIRY;

      await setCookie(
        COOKIE_NAMES.INSTAGRAM_ACCESS_TOKEN,
        result.accessToken,
        {
          maxAge: expiresIn,
        },
      );

      setStatus("success");

      const draft =
        sessionStorage.getItem(
          "onboarding_draft",
        );

      if (draft) {
        const onboardingData =
          JSON.parse(draft);

        onboardingData.connectedAccounts = {
          ...(onboardingData.connectedAccounts ??
            {}),
          instagram: "connected",
        };

        sessionStorage.setItem(
          "onboarding_draft",
          JSON.stringify(onboardingData),
        );
      }

      setTimeout(() => {
        window.location.href =
          "/onboarding?provider=instagram&connected=true";
      }, 1000);
    }

    void processCallback();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B42CEA] mx-auto mb-4" />
            <p className="text-lg text-gray-700">
              Connecting Instagram account...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">
              ✓
            </div>

            <p className="text-lg text-gray-700">
              Instagram connected successfully!
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Redirecting...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">
              ✗
            </div>

            <p className="text-lg text-red-700">
              Instagram connection failed
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Please try again.
            </p>
          </>
        )}
      </div>
    </div>
  );
}