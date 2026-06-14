export interface TwitterProfile {
  id: string;
  userId: string;
  userName: string;
  twitterId: string;

  profileImage?: string;

  followersCount: number;
  followingCount: number;

  allowImport: boolean;

  description?: string;
  location?: string;
  verified?: boolean;

  tweetCount?: number;
  listedCount?: number;

  url?: string;
  createdAt?: string;
}
export interface TwitterContent {
  id: string;

  tweetId: string;

  name: string;

  tweet: string;

  mediaType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;

  permalink?: string;

  timestamp?: string;

  likeCount?: number;
  replyCount?: number;
  repostCount?: number;
  quoteCount?: number;
  impressionCount?: number;

  editHistoryTweetIds?: string[];
}
export interface TwitterContentsResponse {
  contents: TwitterContent[];
}