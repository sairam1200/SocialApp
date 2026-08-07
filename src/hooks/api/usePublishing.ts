"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreatePostRequest,
  CreatePostResponse,
  PublishCalendarResponse,
  PublishChannelsResponse,
  PublishItem,
  PublishQueueResponse,
  PublishStatus,
} from "@/types/publishing.types";

/** The user's own zone, resolved once. Sent with every schedule so a reschedule keeps their hour. */
export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export function usePublishCalendar(
  from: string,
  to: string,
  platforms: string[] = [],
  enabled = true,
) {
  return useQuery<PublishCalendarResponse>({
    queryKey: queryKeys.publishCalendar(from, to, platforms),
    queryFn: () =>
      apiClient.Integration.getPublishCalendar(
        from,
        to,
        platforms.length ? platforms.join(",") : undefined,
      ),
    enabled: enabled && Boolean(from && to),
    // The calendar is glanced at, then acted on. Keeping the previous window
    // on screen while the next one loads avoids the whole grid blanking when
    // the reader steps a month.
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}

export function usePublishQueue(
  statuses: PublishStatus[] = [],
  platforms: string[] = [],
  offset = 0,
  limit = 25,
) {
  return useQuery<PublishQueueResponse>({
    queryKey: queryKeys.publishQueue(statuses, platforms, offset),
    queryFn: () =>
      apiClient.Integration.getPublishQueue(
        statuses.length ? statuses.join(",") : undefined,
        platforms.length ? platforms.join(",") : undefined,
        limit,
        offset,
      ),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}

/**
 * Everything that changes a post invalidates every calendar and queue view.
 *
 * Broad on purpose. The alternative is surgical cache patching across a month
 * grid, a week grid and a list that can each be showing a different slice of
 * the same post, and getting one of them wrong shows the user a post in two
 * places at once.
 */
function useInvalidatePublishing() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["publish", "calendar"] });
    queryClient.invalidateQueries({ queryKey: ["publish", "queue"] });
  };
}

export function useCreatePost() {
  const t = useTranslations("publishing.toast");
  const invalidate = useInvalidatePublishing();

  return useMutation<CreatePostResponse, Error, CreatePostRequest>({
    mutationFn: (request) => apiClient.Integration.createPost(request),
    onSuccess: (result) => {
      invalidate();
      // Partial success is the normal case with five channels and five sets of
      // platform rules, so it gets its own message rather than a silent green
      // toast that hides two rejections.
      if (result.rejected > 0) {
        toast.error(
          t("partial", {
            accepted: result.accepted,
            total: result.accepted + result.rejected,
          }),
        );
        return;
      }
      toast.success(
        result.scheduledAt
          ? t("scheduledTo", { count: result.accepted })
          : t("publishingTo", { count: result.accepted }),
      );
    },
    onError: (error) => toast.error(error.message || t("createFailed")),
  });
}

export function useReschedulePost() {
  const t = useTranslations("publishing.toast");
  const invalidate = useInvalidatePublishing();

  return useMutation<
    PublishItem[],
    Error,
    { publishJobId: string; scheduledAt: string | null; applyToGroup?: boolean }
  >({
    mutationFn: ({ publishJobId, scheduledAt, applyToGroup }) =>
      apiClient.Integration.reschedulePublish(publishJobId, {
        scheduledAt,
        timezone: browserTimezone(),
        applyToGroup,
      }),
    onSuccess: (items) => {
      invalidate();
      toast.success(
        items[0]?.status === "scheduled" ? t("moved") : t("queuedNow"),
      );
    },
    onError: (error) => toast.error(error.message || t("moveFailed")),
  });
}

export function useCancelPost() {
  const t = useTranslations("publishing.toast");
  const invalidate = useInvalidatePublishing();

  return useMutation<
    PublishItem[],
    Error,
    { publishJobId: string; applyToGroup?: boolean }
  >({
    mutationFn: ({ publishJobId, applyToGroup }) =>
      apiClient.Integration.cancelPublish(publishJobId, { applyToGroup }),
    onSuccess: () => {
      invalidate();
      toast.success(t("cancelled"));
    },
    onError: (error) => toast.error(error.message || t("cancelFailed")),
  });
}

export function useDuplicatePost() {
  const t = useTranslations("publishing.toast");
  const invalidate = useInvalidatePublishing();

  return useMutation<
    PublishItem,
    Error,
    { publishJobId: string; scheduledAt: string | null }
  >({
    mutationFn: ({ publishJobId, scheduledAt }) =>
      apiClient.Integration.duplicatePublish(publishJobId, {
        scheduledAt,
        timezone: browserTimezone(),
      }),
    onSuccess: () => {
      invalidate();
      toast.success(t("copied"));
    },
    onError: (error) => toast.error(error.message || t("copyFailed")),
  });
}

/**
 * Every account this user can publish to, in one call.
 *
 * Replaces the composer's hand-written map of five platforms to five bespoke
 * profile hooks. A platform that gains a publisher appears here without a
 * frontend change, which is the whole point: TikTok, X and Threads were
 * publishable on the server for a release before the composer could select
 * them, purely because nobody had added a sixth hook.
 */
export function usePublishChannels() {
  return useQuery<PublishChannelsResponse>({
    queryKey: queryKeys.publishChannels(),
    queryFn: () => apiClient.Integration.getPublishChannels(),
    staleTime: 60_000,
  });
}

/**
 * Whether the composer should offer the writing assistant at all.
 *
 * Asked before the assistant renders, so a deployment with no model credential
 * hides the button instead of offering one that fails on click.
 */
export function useGenerationAvailable() {
  return useQuery<{ available: boolean }>({
    queryKey: queryKeys.generationStatus(),
    queryFn: () => apiClient.Integration.getGenerationStatus(),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}
