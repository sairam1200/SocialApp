"use client";

import { Suspense, use } from "react";
import dynamic from "next/dynamic";

const YouTubeIntegrationCallback = dynamic(() => import("./components/YouTubeIntegrationCallback"), { ssr: false });
const FacebookIntegrationCallback = dynamic(() => import("./components/FacebookIntegrationCallback"), { ssr: false });
const InstagramIntegrationCallback = dynamic(() => import("./components/InstagramIntegrationCallback"), { ssr: false });
const TwitterIntegrationCallback = dynamic(() => import("./components/TwitterIntegrationCallback"), { ssr: false });
const PinterestIntegrationCallback = dynamic(() => import("./components/PinterestIntegrationCallback"), { ssr: false });
const LinkedInIntegrationCallback = dynamic(() => import("./components/LinkedinIntegrationCallback"), { ssr: false });
const TikTokIntegrationCallback = dynamic(() => import("./components/TikTokIntegrationCallback"), { ssr: false });

function IntegrationCallbackFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Connecting account...</p>
      </div>
    </div>
  );
}

interface IntegrationOAuthCallbackPageProps {
  params: Promise<{ platform: string }>;
}

const callbackMap: Record<string, React.ComponentType> = {
  youtube: YouTubeIntegrationCallback,
  facebook: FacebookIntegrationCallback,
  instagram: InstagramIntegrationCallback,
  twitter: TwitterIntegrationCallback,
  pinterest: PinterestIntegrationCallback,
  linkedin: LinkedInIntegrationCallback,
  tiktok: TikTokIntegrationCallback,
};

export default function IntegrationOAuthCallbackPage({ params }: IntegrationOAuthCallbackPageProps) {
  const { platform } = use(params);
  const normalizedPlatform = platform?.toLowerCase();
  const CallbackComponent = callbackMap[normalizedPlatform];

  if (!CallbackComponent) return null;

  return (
    <Suspense fallback={<IntegrationCallbackFallback />}>
      <CallbackComponent />
    </Suspense>
  );
}
