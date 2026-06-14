"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { apiClient } from "@/services/apiClient.service";
import { COOKIE_NAMES } from "@/constants/globals";
import { setCookie } from "@/utils/cookie.util";

type CallbackStatus = "loading" | "success" | "error";

const PLATFORM = "twitter";
const DEFAULT_TOKEN_EXPIRY = 7200;

export default function TwitterIntegrationCallback() {
     console.log("Twitter callback page rendered");
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const hasProcessed = useRef(false);
useEffect(() => {
  console.log(
    "Callback URL:",
    window.location.href
  );

  console.log(
    "code:",
    searchParams.get("code")
  );

  console.log(
    "state:",
    searchParams.get("state")
  );
}, [searchParams]);
useEffect(() => {
  console.log("FULL URL:", window.location.href);
}, []);
useEffect(() => {
    if (hasProcessed.current) return;

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
                error:
                  errorDescription ||
                  error ||
                  "Twitter connection failed",
              },
            }),
          );

        //  window.close();
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

        //  window.close();
        }

        return;
      }

      const result =
        await apiClient.Integration.connectCallback(
          PLATFORM,
          code,
          state,
        );

      if (!result.success || !result.accessToken) {
        setStatus("error");

        if (window.opener) {
          window.opener.dispatchEvent(
            new CustomEvent("oauth_failed", {
              detail: {
                platform: PLATFORM,
                error:
                  result.error ??
                  "Failed to connect Twitter account",
              },
            }),
          );

       //   window.close();
        }

        return;
      }

      const expiresIn =
        parseInt(result.expiresIn, 10) ||
        DEFAULT_TOKEN_EXPIRY;

      await setCookie(
        COOKIE_NAMES.TWITTER_ACCESS_TOKEN,
        result.accessToken,
        {
          maxAge: expiresIn,
        },
      );

      setStatus("success");

      if (window.opener) {
        window.opener.dispatchEvent(
          new CustomEvent("oauth_success", {
            detail: {
              platform: PLATFORM,
              result,
            },
          }),
        );

      //  window.close();
      }
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
              Connecting Twitter account...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-lg text-gray-700">
              Twitter connected successfully!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Closing window...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-lg text-red-700">
              Twitter connection failed
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Closing window...
            </p>
          </>
        )}
      </div>
    </div>
  );
}