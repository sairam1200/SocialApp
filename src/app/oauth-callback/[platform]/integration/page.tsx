"use client";

import { use } from "react";
import YouTubeIntegrationCallback from "./components/YouTubeIntegrationCallback";
import FacebookIntegrationCallback from "./components/FacebookIntegrationCallback";
import InstagramIntegrationCallback from "./components/InstagramIntegrationCallback";
import TwitterIntegrationCallback from "./components/TwitterIntegrationCallback";
import PinterestIntegrationCallback from "./components/PinterestIntegrationCallback";

interface IntegrationOAuthCallbackPageProps {
  params: Promise<{ platform: string }>;
}

export default function IntegrationOAuthCallbackPage({ params }: IntegrationOAuthCallbackPageProps) {
  const { platform } = use(params);
  const normalizedPlatform = platform?.toLowerCase();

  if (normalizedPlatform === "youtube") {
    return <YouTubeIntegrationCallback />;
  }

  if (normalizedPlatform === "facebook") {
    return <FacebookIntegrationCallback />;
  }
  if (normalizedPlatform === "instagram") {
    return < InstagramIntegrationCallback/>;
  }
  if (normalizedPlatform === "twitter") {
    return < TwitterIntegrationCallback/>;
  }
  if (normalizedPlatform === "pininterest") {
    return < PinterestIntegrationCallback/>;
  }
}