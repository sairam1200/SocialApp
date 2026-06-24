import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import { useHttpContext } from "@/providers/HttpContextProvider";

import {
  LinkedInProfile,
  LinkedInContent,
  LinkedInContentsResponse,
} from "@/types/social/linkedin.type";

export function useLinkedInDiscover() {
  const { user } = useHttpContext();

  const [profile, setProfile] =
    useState<LinkedInProfile | null>(null);

  const [contents, setContents] =
    useState<LinkedInContent[]>([]);

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
        await apiClient.Integration.getMe<LinkedInProfile>(
          "linkedin"
        );

      console.log(
        "LINKEDIN PROFILE RESPONSE:",
        profileResponse
      );

      setProfile(profileResponse);

      const contentsResponse =
        await apiClient.Integration.getContents<LinkedInContentsResponse>(
          "linkedin"
        );

      console.log(
        "LINKEDIN CONTENTS RESPONSE:",
        contentsResponse
      );

      setContents(contentsResponse.contents ?? []);
    } catch (error) {
      console.error(
        "LINKEDIN LOAD ERROR:",
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