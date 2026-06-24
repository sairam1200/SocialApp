import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import { useHttpContext } from "@/providers/HttpContextProvider";

import {
  TwitterProfile,
  TwitterContentsResponse,
  TwitterContent,
} from "@/types/social/twitter.type";

export function useTwitterDiscover() {
  const { user } = useHttpContext();

  const [profile, setProfile] =
    useState<TwitterProfile | null>(null);

  const [contents, setContents] =
    useState<TwitterContent[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const profileResponse =
        await apiClient.Integration.getMe<TwitterProfile>(
          "twitter",
        );

      console.log(
        "TWITTER PROFILE RESPONSE:",
        profileResponse,
      );

      setProfile(profileResponse);

      const contentsResponse =
        await apiClient.Integration.getContents<TwitterContentsResponse>(
          "twitter",
        );

      console.log(
        "TWITTER CONTENTS RESPONSE:",
        contentsResponse,
      );

      setContents(
        contentsResponse.contents ?? [],
      );
    } catch (error) {
      console.error(
        "TWITTER LOAD ERROR:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    contents,
    loading,
    refresh: loadData,
  };
}