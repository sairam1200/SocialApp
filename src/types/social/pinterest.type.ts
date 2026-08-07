export interface PinterestProfile {
  id: string;
  userId: string;

  about?: string;
  pinCount?: number;

  email?: string | null;

  followersCount?: number;
  followingCount?: number;

  userName: string;
  pinterestId: string;

  allowImport: boolean;

  monthlyViews?: number;

  profileImage?: string;
  websiteUrl?: string;
}

export interface PinterestContent {
  id: string;

  title?: string;
  type?: string;

  externalId?: string;

  description?: string;

  imageUrl?: string;

  boardId?: string;
  boardName?: string;

  link?: string;

  createdAt?: string;

  pinCount?: number;
}

export interface PinterestContentsResponse {
  contents: PinterestContent[];
}