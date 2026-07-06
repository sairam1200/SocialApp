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

import {
  TwitterProfile,
  TwitterContentsResponse,
  TwitterContent,
} from "@/types/social/twitter.type";

export function useTwitterDiscover() {
  const { user } = useHttpContext();
  const [profile, setProfile] = useState<TwitterProfile | null>(null);
  const [contents, setContents] = useState<TwitterContent[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadData();
  }, [user]);

  const fetchFromApi = async (isBackground: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!isBackground) {
      setLoading(true);
    }

    try {
      const profileResponse =
        await apiClient.Integration.getMe<TwitterProfile>("twitter");
      const contentsResponse =
        await apiClient.Integration.getContents<TwitterContentsResponse>("twitter");

      const uid = user?.[ClaimTypes.UserId] ?? "default";

      await Promise.all([
        setCachedProfile("twitter", uid, profileResponse),
        setCachedContent("twitter", uid, contentsResponse.contents ?? [], null, false),
      ]);

      if (mountedRef.current) {
        setProfile(profileResponse);
        setContents(contentsResponse.contents ?? []);
      }
    } catch (error) {
      console.error("TWITTER LOAD ERROR:", error);
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
        getCachedProfile("twitter", uid),
        getCachedContent("twitter", uid),
      ]);

      if (cachedProfile && cachedContent && mountedRef.current) {
        setProfile(cachedProfile.data as TwitterProfile);
        setContents(cachedContent.data.contents as TwitterContent[]);

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
        invalidateDiscoverCache("twitter", uid);
      }
      fetchFromApi(false);
    },
  };
}