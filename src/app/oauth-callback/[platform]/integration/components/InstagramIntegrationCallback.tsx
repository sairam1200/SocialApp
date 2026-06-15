"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { apiClient } from "@/services/apiClient.service";
import { COOKIE_NAMES } from "@/constants/globals";
import { setCookie } from "@/utils/cookie.util";
import { InstagramProfileType } from "@/types/account/profile.type";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "@/types/jwtPayload.type";
type CallbackStatus = "loading" | "success" | "error";

const PLATFORM = "instagram";
const DEFAULT_TOKEN_EXPIRY = 3600;
const token = localStorage.getItem("accessToken");
let onboardingStep: string | undefined;
export default function InstagramIntegrationCallback() {
  const searchParams = useSearchParams();

  const [status, setStatus] =
    useState<CallbackStatus>("loading");

  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;

    const processCallback = async () => {
      try {
        console.log(
          "[INSTAGRAM CALLBACK] URL:",
          window.location.href,
        );

        const code = searchParams.get("code");
        const state = searchParams.get("state");

        const error = searchParams.get("error");
        const errorDescription =
          searchParams.get("error_description");

        console.log(
          "[INSTAGRAM CALLBACK] Params:",
          {
            code,
            state,
            error,
            errorDescription,
          },
        );

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

            setTimeout(() => {
              window.close();
            }, 500);
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
                  error:
                    !code
                      ? "Authorization code is missing"
                      : "Authorization state is missing",
                },
              }),
            );

            setTimeout(() => {
              window.close();
            }, 500);
          }

          return;
        }

        console.log(
          "[INSTAGRAM CALLBACK] Calling backend callback...",
        );

        const result =
          await apiClient.Integration.connectCallback<InstagramProfileType>(
            PLATFORM,
            code,
            state,
          );

        console.log(
          "[INSTAGRAM CALLBACK] Backend response:",
          result,
        );

        if (
          !result ||
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
                    result?.error ??
                    "Failed to connect Instagram account",
                },
              }),
            );

            setTimeout(() => {
              window.close();
            }, 500);
          }

          return;
        }

        const expiresIn =
          parseInt(
            String(result.expiresIn),
            10,
          ) || DEFAULT_TOKEN_EXPIRY;

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

        /**
         * IMPORTANT:
         * Notify parent window (same pattern used by OAuth popup flow)
         */
        if (window.opener) {
          window.opener.dispatchEvent(
            new CustomEvent("oauth_success", {
              detail: {
                platform: PLATFORM,
              },
            }),
          );

          setTimeout(() => {
            window.close();
          }, 1000);

          return;
        }

        /**
         * Fallback if opened directly
         */
        if (token) {
                const payload = jwtDecode<JwtPayload>(token);
                onboardingStep = payload.onboardingStep;
                console.log(payload.onboardingStep);
              }
        setTimeout(() => {
          if (onboardingStep !== "Completed") {
            window.location.href =
              "/onboarding?provider=youtube&connected=true";
            return;
          }else{
            window.close();
          }
        }, 1000);
      } catch (error) {
        console.error(
          "[INSTAGRAM CALLBACK] ERROR:",
          error,
        );

        setStatus("error");

        if (window.opener) {
          window.opener.dispatchEvent(
            new CustomEvent("oauth_failed", {
              detail: {
                platform: PLATFORM,
                error:
                  error instanceof Error
                    ? error.message
                    : "Instagram connection failed",
              },
            }),
          );

          setTimeout(() => {
            window.close();
          }, 500);
        }
      }
    };

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
              Closing window...
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