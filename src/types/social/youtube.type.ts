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

export type YoutubeUploadRequest = {
  accountId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  tags?: string[];
  visibility: "public" | "private" | "unlisted";
  publishAt?: string;
};

export type YoutubeUploadResponse = {
  videoId: string;
  videoUrl: string;
  publishAt?: string;
  status: "queued" | "published" | "scheduled" | "uploading" | "failed";
};

export type YoutubeStatsResponse = {
  views: number;
  likes: number;
  comments: number;
  watchTime: number;
};

export type YoutubeProfileResponse = {
  channelId: string;
  channelTitle: string;
  subscriberCount: number;
  videoCount: number;
};

export type YoutubeSyncResponse = {
  success: boolean;
  message: string;
};

export type YoutubeVideoStatus = "published" | "scheduled" | "uploading" | "processing" | "queued" | "failed";
