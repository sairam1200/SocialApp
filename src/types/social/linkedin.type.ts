export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  industry?: string;
  location?: string;
  email?: string | null;
  followersCount?: number;
  followingCount?: number;
  userName?: string;
  linkedInId?: string;
  profileImage?: string;
  allowImport?: boolean;
}

export interface LinkedInContent {
  id: string;
  title?: string;
  type?: string;
  externalId?: string;

  text?: string;
  commentary?: unknown;
  author?: {
    name?: string;
    profileUrl?: string;
    image?: string;
  };

  created?: string;
  lastModified?: string;

  activity?: {
    likes?: number;
    comments?: number;
    shares?: number;
    impressions?: number;
  };
}

export interface LinkedInContentsResponse {
  contents: LinkedInContent[];
}