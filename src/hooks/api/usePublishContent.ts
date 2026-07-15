"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";

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
}

export function usePublishContent() {
  const queryClient = useQueryClient();

  return useMutation<
    { publishJobId: string; platform: string; status: string },
    Error,
    PublishContentRequest
  >({
    mutationFn: (request) => apiClient.Integration.publishContent(request),
    onSuccess: (result) => {
      toast.success(`Publishing to ${result.platform}...`);
      queryClient.invalidateQueries({
        queryKey: queryKeys.publishStatus(result.publishJobId),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish content");
    },
  });
}

export function usePublishStatus(publishJobId: string | null) {
  return useQuery<PublishJobStatus>({
    queryKey: queryKeys.publishStatus(publishJobId ?? ""),
    queryFn: () => apiClient.Integration.getPublishStatus(publishJobId!),
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
