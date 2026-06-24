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
  useEffect(() => {
    if (!user || !enabled) {
      setLoading(false);
      return;
    }

    loadData();
  }, [user, enabled]);
  const loadData = async () => {
    try {


      const profileResponse =
        await apiClient.Integration.getMe<YoutubeProfile>(
          "youtube"
        );
      console.log(
        "YOUTUBE PROFILE RESPONSE:",
        profileResponse
      );
      setProfile(profileResponse);
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
      setContents(allContents);
     /*  const profileSyncrequest =
        await apiClient.Integration.enableSync(
          "youtube"
        );
      console.log(
        "YOUTUBE SYNC RESPONSE:",
        profileSyncrequest
      ); */
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