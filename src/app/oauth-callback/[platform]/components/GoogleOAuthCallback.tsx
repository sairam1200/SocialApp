"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { oauthCallbackAction } from "@/actions/token.actions";

const REDIRECT_DELAY_ERROR = 3000;

type CallbackStatus = "loading" | "success" | "error";

async function handlePostAuthNavigation(
  onboardingCompleted: boolean,
  router: ReturnType<typeof useRouter>
): Promise<void> {
  if (!onboardingCompleted) {
    router.replace("/onboarding");
  } else {
    router.replace("/discover");
  }
  router.refresh();
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

        const result = await oauthCallbackAction({
          platform: "google",
          code,
          state,
          redirectUrl,
        });

        if (!result.succeeded) {
          handleError(
            result?.message || "Google authentication failed",
            setStatus,
            setMessage,
            router
          );
          return;
        }

        setStatus("success");
        setMessage("Authentication successful!");
        toast.success("Authentication successful!");

        await handlePostAuthNavigation(result.onboardingCompleted ?? true, router);
      } catch (error) {
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-success text-4xl mb-4">✓</div>
            <p className="text-lg text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-destructive text-4xl mb-4">✗</div>
            <p className="text-lg text-destructive">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
}
