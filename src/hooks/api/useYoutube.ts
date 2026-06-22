"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import {
  YoutubeStatsResponse,
  YoutubeProfileResponse,
  YoutubeUploadRequest,
  YoutubeUploadResponse,
} from "@/types/social/youtube.type";
import toast from "react-hot-toast";

export const youtubeKeys = {
  all: ["youtube"] as const,
  profile: () => [...youtubeKeys.all, "profile"] as const,
  stats: () => [...youtubeKeys.all, "stats"] as const,
  videos: () => [...youtubeKeys.all, "videos"] as const,
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

  return useMutation<YoutubeUploadResponse, Error, YoutubeUploadRequest>({
    mutationFn: (data) => apiClient.Youtube.uploadVideo(data),
    onSuccess: (result) => {
      if (result.status === "published") {
        toast.success("Video published to YouTube successfully");
      } else if (result.status === "scheduled") {
        toast.success("Video scheduled on YouTube successfully");
      }
      queryClient.invalidateQueries({ queryKey: youtubeKeys.videos() });
      queryClient.invalidateQueries({ queryKey: youtubeKeys.stats() });
    },
    onError: () => {
      toast.error("Failed to upload video to YouTube. Please try again.");
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
