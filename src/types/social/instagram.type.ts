export type InstagramProfile = {
  id: string;

  userId: string;
  userName: string;

  instagramId: string;

  profileImage?: string;

  followersCount: number;
  followingCount: number;

  allowImport: boolean;

  accountType?: string;
  biography?: string;
  websiteUrl?: string;

  mediaCount?: number;
};

export type InstagramContent = {
  id: string;

  externalId: string;

  title?: string;
  caption?: string;

  type: string;

  mediaType: string;

  mediaUrl?: string;
  thumbnailUrl?: string;

  permalink?: string;

  username?: string;

  likeCount?: number;
  commentsCount?: number;

  timestamp?: string;

  createdAt?: string;
  updatedAt?: string;
};

export type InstagramContentsResponse = {
  contents: InstagramContent[];

  nextCursor: string | null;

  hasMore: boolean;
  success: boolean;
};

export type InstagramMediaInsights = {
  likeCount: number;
  commentsCount: number;
};

export type InstagramConnectResponse = {
  success: boolean;

  accessToken: string;

  expiresIn: string;

  profile: InstagramProfile;
};

export type InstagramAccountMetadata = {
  accountType?: string;

  biography?: string;

  mediaCount?: number;

  websiteUrl?: string;
};