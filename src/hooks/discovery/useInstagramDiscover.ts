import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import { useHttpContext } from "@/providers/HttpContextProvider";

import {
  InstagramProfile,
  InstagramContent,
  InstagramContentsResponse,
} from "@/types/social/instagram.type";

export function useInstagramDiscover() {
  const { user } = useHttpContext();

  const [profile, setProfile] =
    useState<InstagramProfile | null>(null);

  const [contents, setContents] =
    useState<InstagramContent[]>([]);

  const [loading, setLoading] = useState(true);

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
        await apiClient.Integration.getProfile<InstagramProfile>(
          "instagram"
        );

      console.log(
        "INSTAGRAM PROFILE RESPONSE:",
        profileResponse
      );

      setProfile(profileResponse);

      const contentsResponse =
        await apiClient.Integration.getContents<InstagramContentsResponse>(
          "instagram"
        );

      console.log(
        "INSTAGRAM CONTENTS RESPONSE:",
        contentsResponse
      );

      setContents(contentsResponse.contents ?? []);
    } catch (error) {
      console.error(
        "INSTAGRAM LOAD ERROR:",
        error
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