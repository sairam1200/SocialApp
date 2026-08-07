// src/hooks/useYoutubeDiscover.ts

import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/services/apiClient.service";
import { useHttpContext } from "@/providers/HttpContextProvider";
import { ClaimTypes } from "@/constants/globals";
import {
  getCachedProfile,
  setCachedProfile,
  getCachedContent,
  setCachedContent,
  invalidateDiscoverCache,
} from "@/lib/discover-cache";

export type YoutubeChannelType = {
  id: string;
  title: string;
  description: string;
  handle: string;
  viewCount: number;
  videoCount: number;
  thumbnail: string;
};
export type YoutubeProfile = {
  id: string;
  name: string;
  email: string;
  userId: string;
  userName: string;
  youtubeId: string;

  profileImage: string;

  followersCount: number;
  followingCount: number;

  allowImport: boolean;

  channel: YoutubeChannelType;
};
export type YoutubeContent = {
  id: string;
  externalId: string;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  type: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shorts: boolean;
};
export type YoutubeContentsResponse = {
  contents: YoutubeContent[];
  nextCursor: string | null;
  hasMore: boolean;
  success: boolean;
};
export function useYoutubeDiscover({ enabled = true }: { enabled?: boolean } = {}) {
  const [profile, setProfile] = useState<YoutubeProfile | null>(null);
  const [contents, setContents] = useState<YoutubeContent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useHttpContext();
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!user || !enabled) {
      setLoading(false);
      return;
    }
    loadData();
  }, [user, enabled]);

  const fetchFromApi = async (isBackground: boolean) => {
    loadingRef.current = true;

    if (!isBackground) {
      setLoading(true);
    }

    try {
      const profileResponse =
        await apiClient.Integration.getMe<YoutubeProfile>("youtube");
      let allContents: YoutubeContent[] = [];
      let cursor: string | undefined;
      let hasMore = true;
      while (hasMore) {
        const contentsResponse =
          await apiClient.Integration.getContents<YoutubeContentsResponse>(
            "youtube",
            cursor
          );
        allContents = allContents.concat(contentsResponse.contents ?? []);
        cursor = contentsResponse.nextCursor ?? undefined;
        hasMore = contentsResponse.hasMore ?? false;
      }

      const uid = user?.[ClaimTypes.UserId] ?? "default";

      await Promise.all([
        setCachedProfile("youtube", uid, profileResponse),
        setCachedContent("youtube", uid, allContents, cursor ?? null, hasMore),
      ]);

      if (mountedRef.current) {
        setProfile(profileResponse);
        setContents(allContents);
      }
    } catch {
      // silent
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  };

  const loadData = async () => {
    if (!user) return;

    const uid = user[ClaimTypes.UserId] ?? "default";

    try {
      const [cachedProfile, cachedContent] = await Promise.all([
        getCachedProfile("youtube", uid),
        getCachedContent("youtube", uid),
      ]);

      if (cachedProfile && cachedContent && mountedRef.current) {
        setProfile(cachedProfile.data as YoutubeProfile);
        setContents(cachedContent.data.contents as YoutubeContent[]);

        if (!cachedProfile.isStale && !cachedContent.isStale) {
          setLoading(false);
          return;
        }

        fetchFromApi(true);
        return;
      }
    } catch {
      // Cache error, fall through to API
    }

    fetchFromApi(false);
  };

  return {
    profile,
    contents,
    loading,
    refresh: () => {
      if (user) {
        const uid = user[ClaimTypes.UserId] ?? "default";
        invalidateDiscoverCache("youtube", uid);
      }
      fetchFromApi(false);
    },
  };
}