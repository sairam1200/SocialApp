"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  integrationOAuthCallbackAction,
  type IntegrationPlatform,
} from "@/actions/token.actions";

type CallbackStatus = "loading" | "success" | "error";

interface IntegrationOAuthCallbackProps {
  platform: IntegrationPlatform;
  displayName: string;
}

export default function IntegrationOAuthCallback({
  platform,
  displayName,
}: IntegrationOAuthCallbackProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const notifyOpener = (eventName: "oauth_success" | "oauth_failed", error?: string) => {
      if (!window.opener) return false;
      window.opener.dispatchEvent(
        new CustomEvent(eventName, { detail: { platform, error } }),
      );
      return true;
    };

    const fail = (message: string) => {
      setStatus("error");
      setErrorMessage(message);
      if (notifyOpener("oauth_failed", message)) {
        window.setTimeout(() => window.close(), 800);
      }
    };

    const processCallback = async () => {
      const providerError = searchParams.get("error");
      const providerDescription = searchParams.get("error_description");
      if (providerError) {
        fail(providerDescription || providerError || `${displayName} connection failed`);
        return;
      }

      const code = searchParams.get("code");
      const state = searchParams.get("state");
      if (!code || !state) {
        fail(!code ? "Authorization code is missing" : "Authorization state is missing");
        return;
      }

      const result = await integrationOAuthCallbackAction({ platform, code, state });
      if (!result.success) {
        fail(result.error || `${displayName} connection failed`);
        return;
      }

      setStatus("success");
      const draft = sessionStorage.getItem("onboarding_draft");
      if (draft) {
        try {
          const onboardingData = JSON.parse(draft) as {
            connectedAccounts?: Record<string, string>;
          };
          onboardingData.connectedAccounts = {
            ...onboardingData.connectedAccounts,
            [platform]: "connected",
          };
          sessionStorage.setItem("onboarding_draft", JSON.stringify(onboardingData));
        } catch {
          // A malformed draft must not invalidate an otherwise successful OAuth flow.
        }
      }

      if (notifyOpener("oauth_success")) {
        window.setTimeout(() => window.close(), 800);
        return;
      }

      const destination = result.onboardingCompleted === false
        ? `/onboarding?provider=${encodeURIComponent(platform)}&connected=true`
        : "/discover";
      window.setTimeout(() => {
        router.replace(destination);
        router.refresh();
      }, 800);
    };

    void processCallback();
  }, [displayName, platform, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center" role="status" aria-live="polite">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-lg text-muted-foreground">Connecting {displayName} account…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mb-4 text-4xl text-success" aria-hidden="true">✓</div>
            <p className="text-lg text-muted-foreground">{displayName} connected successfully.</p>
            <p className="mt-2 text-sm text-muted-foreground">Returning to Gaddr…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mb-4 text-4xl text-destructive" aria-hidden="true">×</div>
            <p className="text-lg text-destructive">{errorMessage || `${displayName} connection failed`}</p>
            <p className="mt-2 text-sm text-muted-foreground">You can close this window and try again.</p>
          </>
        )}
      </div>
    </div>
  );
}
