

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import { useHttpContext } from "@/providers/HttpContextProvider";

import {
  FacebookProfile,
  FacebookContent,
  FacebookContentsResponse,
} from "@/types/social/facebook.type";

export function useFacebookDiscover() {
  const { user } = useHttpContext();

  const [profile, setProfile] =
    useState<FacebookProfile | null>(null);

  const [contents, setContents] =
    useState<FacebookContent[]>([]);

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
        await apiClient.Integration.getMe<FacebookProfile>(
          "facebook"
        );

      console.log(
        "FACEBOOK PROFILE RESPONSE:",
        profileResponse
      );

      setProfile(profileResponse);

      const contentsResponse =
        await apiClient.Integration.getContents<FacebookContentsResponse>(
          "facebook"
        );

      console.log(
        "FACEBOOK CONTENTS RESPONSE:",
        contentsResponse
      );

      setContents(contentsResponse.contents ?? []);

      

     
    } catch (error) {
      console.error(
        "FACEBOOK LOAD ERROR:",
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