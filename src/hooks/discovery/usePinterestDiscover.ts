import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import { useHttpContext } from "@/providers/HttpContextProvider";

import {
  PinterestProfile,
  PinterestContent,
  PinterestContentsResponse,
} from "@/types/social/pinterest.type";

export function usePinterestDiscover() {
  const { user } = useHttpContext();

  const [profile, setProfile] =
    useState<PinterestProfile | null>(null);

  const [contents, setContents] =
    useState<PinterestContent[]>([]);

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
        await apiClient.Integration.getProfile<PinterestProfile>(
          "pinterest"
        );

      console.log(
        "PINTEREST PROFILE RESPONSE:",
        profileResponse
      );

      setProfile(profileResponse);

      const contentsResponse =
        await apiClient.Integration.getContents<PinterestContentsResponse>(
          "pinterest"
        );

      console.log(
        "PINTEREST CONTENTS RESPONSE:",
        contentsResponse
      );

      setContents(contentsResponse.contents ?? []);
    } catch (error) {
      console.error(
        "PINTEREST LOAD ERROR:",
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