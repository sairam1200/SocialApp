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
  LinkedInProfile,
  LinkedInContent,
  LinkedInContentsResponse,
} from "@/types/social/linkedin.type";

export function useLinkedInDiscover({ enabled = true }: { enabled?: boolean } = {}) {
  const { user } = useHttpContext();
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [contents, setContents] = useState<LinkedInContent[]>([]);
  const [loading, setLoading] = useState(true);
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
        await apiClient.Integration.getMe<LinkedInProfile>("linkedin");
      const contentsResponse =
        await apiClient.Integration.getContents<LinkedInContentsResponse>("linkedin");

      const uid = user?.[ClaimTypes.UserId] ?? "default";

      await Promise.all([
        setCachedProfile("linkedin", uid, profileResponse),
        setCachedContent("linkedin", uid, contentsResponse.contents ?? [], null, false),
      ]);

      if (mountedRef.current) {
        setProfile(profileResponse);
        setContents(contentsResponse.contents ?? []);
      }
    } catch (error) {
      console.error("LINKEDIN LOAD ERROR:", error);
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
        getCachedProfile("linkedin", uid),
        getCachedContent("linkedin", uid),
      ]);

      if (cachedProfile && cachedContent && mountedRef.current) {
        setProfile(cachedProfile.data as LinkedInProfile);
        setContents(cachedContent.data.contents as LinkedInContent[]);

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
        invalidateDiscoverCache("linkedin", uid);
      }
      fetchFromApi(false);
    },
  };
}