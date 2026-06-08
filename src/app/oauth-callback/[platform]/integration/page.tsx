"use client";

import { use } from "react";
import YouTubeIntegrationCallback from "./components/YouTubeIntegrationCallback";
import FacebookIntegrationCallback from "./components/FacebookIntegrationCallback";

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
}