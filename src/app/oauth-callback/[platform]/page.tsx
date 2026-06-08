"use client";

import { use } from "react";
import GoogleOAuthCallback from "./components/GoogleOAuthCallback";
import FacebookOAuthCallback from "./components/FacebookOAuthCallback";

interface OAuthCallbackPageProps {
  params: Promise<{ platform: string }>;
}

export default function OAuthCallbackPage({ params }: OAuthCallbackPageProps) {
  const { platform } = use(params);
  const normalizedPlatform = platform?.toLowerCase();

  if (normalizedPlatform === "google") {
    return <GoogleOAuthCallback />;
  }

  if (normalizedPlatform === "facebook") {
    return <FacebookOAuthCallback />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-red-500 text-4xl mb-4">✗</div>
        <p className="text-lg text-red-700">Invalid OAuth provider</p>
        <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
      </div>
    </div>
  );
}
