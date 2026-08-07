"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";
import { PublishCapabilities } from "@/types/integrations.types";
import { devError, devLog } from "@/utils/devLogger";

export interface PublishJobStatus {
  id: string;
  platform: string;
  status: string;
  progress: number;
  statusMessage?: string;
  platformContentId?: string;
  platformContentUrl?: string;
  attempts: number;
  lastError?: string;
  nextRetryAt?: string;
  createdAt: string;
}

export interface PublishContentRequest {
  linkedAccountId: string;
  platform: string;
  uploadId: string;
  title: string;
  description?: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'unlisted';
  publishAt?: string;
  postType?: string;
  metadata?: Record<string, unknown>;
}

export function usePublishContent() {
  const queryClient = useQueryClient();

  return useMutation<
    { publishJobId: string; platform: string; status: string },
    Error,
    PublishContentRequest
  >({
    mutationFn: (request) => {
      devLog("publish API request", {
        platform: request.platform,
        uploadId: request.uploadId,
        hasDescription: Boolean(request.description),
        tagCount: request.tags?.length ?? 0,
      });
      return apiClient.Integration.publishContent(request);
    },
    onSuccess: (result) => {
      devLog("publish API response", result);
      toast.success(`Publishing to ${result.platform}...`);
      queryClient.invalidateQueries({
        queryKey: queryKeys.publishStatus(result.publishJobId),
      });
    },
    onError: (error) => {
      devError("publish API error", { error: error.message });
      toast.error(error.message || "Failed to publish content");
    },
  });
}

export function usePublishStatus(publishJobId: string | null) {
  return useQuery<PublishJobStatus>({
    queryKey: queryKeys.publishStatus(publishJobId ?? ""),
    queryFn: async () => {
      devLog("publish status poll", { publishJobId });
      const result = await apiClient.Integration.getPublishStatus(publishJobId!);
      devLog("publish status response", {
        publishJobId,
        platform: result.platform,
        status: result.status,
        progress: result.progress,
      });
      return result;
    },
    enabled: !!publishJobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      if (
        data.status === "completed" ||
        data.status === "failed" ||
        data.status === "expired"
      ) {
        return false;
      }
      return 2000;
    },
  });
}

export function usePublishCapabilities() {
  return useQuery<PublishCapabilities>({
    queryKey: queryKeys.publishCapabilities(),
    queryFn: () => apiClient.Integration.getPublishCapabilities(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
