// src/hooks/useYoutubeDiscover.ts

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import { useHttpContext } from "@/providers/HttpContextProvider";

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
};
export type YoutubeContentsResponse = {
  contents: YoutubeContent[];
  nextCursor: string | null;
  hasMore: boolean;
  success: boolean;
};
export function useYoutubeDiscover() {
  const [profile, setProfile] = useState<YoutubeProfile | null>(null);
  const [contents, setContents] = useState<YoutubeContent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useHttpContext();
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
        await apiClient.Integration.getProfile<YoutubeProfile>(
          "youtube"
        );
      console.log(
        "YOUTUBE PROFILE RESPONSE:",
        profileResponse
      );
      setProfile(profileResponse);
      const contentsResponse =
        await apiClient.Integration.getContents<YoutubeContentsResponse>(
          "youtube"
        );
      console.log(
        "YOUTUBE CONTENTS RESPONSE:",
        contentsResponse
      );
      setContents(contentsResponse.contents ?? []);
      const profileSyncrequest =
        await apiClient.Integration.enableSync(
          "youtube"
        );
      console.log(
        "YOUTUBE SYNC RESPONSE:",
        profileSyncrequest
      );
    } catch (error: unknown) {
      console.error("YOUTUBE LOAD ERROR:", error);

      if (error instanceof Error) {
        console.log("MESSAGE:", error.message);
        console.log("NAME:", error.name);
      }

      console.log("RAW ERROR:", JSON.stringify(error, null, 2));
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