
export type FacebookPageType = {
  id: string;
  name: string;
  category?: string;
  picture?: string;
};

export type FacebookProfile = {
  id: string;
  name: string;
  email: string;
  userId: string;
  userName: string;
  facebookId: string;

  profileImage: string;

  followersCount: number;
  followingCount: number;

  allowImport: boolean;

  page?: FacebookPageType;
};

export type FacebookContent = {
  id: string;
  externalId: string;
  postId: string;

  title?: string;
  description?: string;
  message: string;

  thumbnailUrl?: string;

  permalinkUrl?: string;

  createdTime: string;

  type: string;
};

export type FacebookContentsResponse = {
  contents: FacebookContent[];
  nextCursor: string | null;
  hasMore: boolean;
  success: boolean;
};