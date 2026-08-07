"use client";

import { Suspense, use } from "react";
import dynamic from "next/dynamic";

const GoogleOAuthCallback = dynamic(() => import("./components/GoogleOAuthCallback"), { ssr: false });
const FacebookOAuthCallback = dynamic(() => import("./components/FacebookOAuthCallback"), { ssr: false });

interface OAuthCallbackPageProps {
  params: Promise<{ platform: string }>;
}

function OAuthCallbackFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage({ params }: OAuthCallbackPageProps) {
  const { platform } = use(params);
  const normalizedPlatform = platform?.toLowerCase();

  return (
    <Suspense fallback={<OAuthCallbackFallback />}>
      {normalizedPlatform === "google" ? (
        <GoogleOAuthCallback />
      ) : normalizedPlatform === "facebook" ? (
        <FacebookOAuthCallback />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-destructive text-4xl mb-4">✗</div>
            <p className="text-lg text-destructive">Invalid OAuth provider</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting to login...</p>
          </div>
        </div>
      )}
    </Suspense>
  );
}
