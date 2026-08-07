export interface RedditProfile {
  id: string;
  userId: string;
  redditId: string;
  userName: string;
  profileImage: string;
  allowImport: boolean;
  karma: { link: number; comment: number; total: number };
  isVerified: boolean;
  isGold: boolean;
  isMod: boolean;
  hasVerifiedEmail: boolean;
  over18: boolean;
  redditUrl: string;
  description: string;
  displayName: string;
  createdAt: string;
}

export interface RedditContent {
  id: string;
  externalId: string;
  title?: string;
  description?: string;
  type: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  permalink?: string;
  author?: string;
  subreddit?: string;
  ups?: number;
  downs?: number;
  upvoteRatio?: number;
  numComments?: number;
  score?: number;
  created?: string;
}

export interface RedditContentsResponse {
  contents: RedditContent[];
}
