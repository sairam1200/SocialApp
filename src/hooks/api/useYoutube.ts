"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import {
  YoutubeStatsResponse,
  YoutubeProfileResponse,
  YoutubeUploadResponse,
  YoutubeVideoStatusResponse,
} from "@/types/social/youtube.type";
import toast from "react-hot-toast";

export const youtubeKeys = {
  all: ["youtube"] as const,
  profile: () => [...youtubeKeys.all, "profile"] as const,
  stats: () => [...youtubeKeys.all, "stats"] as const,
  videos: () => [...youtubeKeys.all, "videos"] as const,
  uploadStatus: (videoId: string) => [...youtubeKeys.all, "uploadStatus", videoId] as const,
};

export function useYoutubeProfile() {
  return useQuery<YoutubeProfileResponse>({
    queryKey: youtubeKeys.profile(),
    queryFn: () => apiClient.Integration.getProfile<YoutubeProfileResponse>("youtube"),
  });
}

export function useYoutubeStats() {
  return useQuery<YoutubeStatsResponse>({
    queryKey: youtubeKeys.stats(),
    queryFn: () => apiClient.Youtube.getStats(),
  });
}

export function useUploadYoutubeVideo() {
  const queryClient = useQueryClient();

  return useMutation<YoutubeUploadResponse, Error, FormData>({
    mutationFn: (formData) => apiClient.Youtube.uploadVideo(formData),
    onSuccess: (result) => {
      if (result.status === "queued" || result.status === "published") {
        toast.success("Video upload job queued");
      } else if (result.status === "scheduled") {
        toast.success("Video scheduled on YouTube successfully");
      }
      queryClient.invalidateQueries({ queryKey: youtubeKeys.videos() });
      queryClient.invalidateQueries({ queryKey: youtubeKeys.stats() });
    },
    onError: () => {
      toast.error("Failed to upload video. Please try again.");
    },
  });
}

export function useUploadStatus(videoId: string | null) {
  return useQuery<YoutubeVideoStatusResponse>({
    queryKey: youtubeKeys.uploadStatus(videoId ?? ""),
    queryFn: () => apiClient.Youtube.getUploadStatus(videoId!),
    enabled: !!videoId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      if (data.status === "completed" || data.status === "published" || data.status === "failed" || data.status === "scheduled") {
        return false;
      }
      return 2000;
    },
  });
}

export function useRetryUpload() {
  const queryClient = useQueryClient();

  return useMutation<{ jobId: string; status: string }, Error, string>({
    mutationFn: (videoId) => apiClient.Youtube.retryUpload(videoId),
    onSuccess: () => {
      toast.success("Upload retry queued");
      queryClient.invalidateQueries({ queryKey: youtubeKeys.all });
    },
    onError: () => {
      toast.error("Failed to retry upload");
    },
  });
}

export function useSyncYoutube() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.Youtube.sync(),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("YouTube sync completed successfully");
      } else {
        toast.error(result.message || "YouTube sync failed");
      }
      queryClient.invalidateQueries({ queryKey: youtubeKeys.all });
    },
    onError: () => {
      toast.error("Failed to sync YouTube. Please try again.");
    },
  });
}
