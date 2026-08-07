/**
 * Community API types.
 *
 * Mirrors `backend/src/domain/contracts/social.model.ts`. Hand-written rather
 * than generated because the generator would also drag in every Nest decorator
 * type; when the backend contract changes, change this file in the same PR.
 *
 * Money is a **string** everywhere, in minor units. `number` loses precision
 * past 2^53 and JSON has no other integer type — a creator's earnings are
 * exactly where that matters.
 */

export type PostKind =
  | "update"
  | "photo"
  | "video"
  | "story"
  | "poll"
  | "article"
  | "comment"
  | "repost"
  | "live"
  | "clip";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived"
  | "removed";

export type Visibility =
  | "public"
  | "followers"
  | "close_friends"
  | "brand_partners"
  | "private";

export type ProfileKind = "person" | "creator" | "brand";

export type ReactionType =
  | "like"
  | "celebrate"
  | "insightful"
  | "support"
  | "funny";

export type DisclosureKind =
  | "none"
  | "paid_partnership"
  | "gifted"
  | "affiliate"
  | "own_brand";

export type AttachmentKind =
  | "moment"
  | "place"
  | "product"
  | "profile"
  | "link"
  | "stream"
  | "course";

export type MediaKind = "image" | "video" | "audio" | "document";

export type FeedMode = "recommended" | "latest";

export interface ProfileSummary {
  id: string;
  handle: string;
  displayName: string;
  kind: ProfileKind;
  avatarUrl?: string;
  headline?: string;
  isVerified: boolean;
  followersCount: number;
  /** Null when the reader is anonymous — "unknown", not "no". */
  isFollowedByViewer?: boolean | null;
}

export interface CommunityProfile extends ProfileSummary {
  bio?: string;
  bannerUrl?: string;
  location?: string;
  websiteUrl?: string;
  category?: string;
  topics: string[];
  followingCount: number;
  postsCount: number;
  openToCollaborations: boolean;
  tipsEnabled: boolean;
  subscriptionsEnabled: boolean;
  profileVisibility: Visibility;
  isViewer: boolean;
  certifications: Array<{
    id: string;
    title: string;
    issuedOn: string;
    verificationCode: string;
  }>;
  createdOn: string;
}

export interface PostMedia {
  id: string;
  kind: MediaKind;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  altText?: string;
  placeholderColor?: string;
}

export interface PollOption {
  id: string;
  label: string;
  votesCount: number;
  /** 0–1. Computed server-side so every client agrees. */
  share: number;
}

export interface Poll {
  options: PollOption[];
  totalVotes: number;
  closesOn?: string | null;
  isClosed: boolean;
  viewerOptionId?: string | null;
}

export interface ProductTag {
  productId: string;
  title: string;
  priceMinor?: string;
  currency: string;
  imageUrl?: string;
  url?: string;
  x?: number;
  y?: number;
  mediaIndex?: number;
}

export interface Post {
  id: string;
  kind: PostKind;
  status: PostStatus;
  visibility: Visibility;
  author: ProfileSummary;
  title?: string;
  body?: string;
  media: PostMedia[];
  poll?: Poll | null;
  products: ProductTag[];
  attachmentKind?: AttachmentKind | null;
  place?: { name: string; latitude?: number; longitude?: number } | null;
  linkPreview?: {
    url: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    siteName?: string;
  } | null;
  tags: string[];
  topics: string[];
  mentions?: ProfileSummary[];
  isSponsored: boolean;
  disclosure: DisclosureKind;
  sponsor?: ProfileSummary | null;
  parentId?: string | null;
  rootId?: string | null;
  repostOf?: Post | null;
  streamId?: string | null;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  sharesCount: number;
  viewerReaction?: ReactionType | null;
  canEdit: boolean;
  scheduledFor?: string | null;
  publishedOn?: string | null;
  expiresOn?: string | null;
  createdOn: string;
  url: string;
  /** Why this appeared in a ranked feed. Empty in Latest. */
  reasons: string[];
}

export interface FeedPage {
  mode: FeedMode;
  items: Post[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface SourceWeights {
  following: number;
  topicAffinity: number;
  coEngagement: number;
  trending: number;
  similarAuthors: number;
  fresh: number;
}

export interface ObjectiveWeights {
  like: number;
  comment: number;
  repost: number;
  share: number;
  bookmark: number;
  dwell: number;
  profileVisit: number;
  videoWatch: number;
  click: number;
  purchase: number;
  negative: number;
}

/** Everything the reader can change about their own feed. */
export interface FeedPreferences {
  sources: SourceWeights;
  objectives: ObjectiveWeights;
  recencyHalfLifeHours: number;
  diversityLambda: number;
  maxPostsPerAuthor: number;
  explorationStrength: number;
  sponsoredEveryN: number;
  mutedTopics: string[];
  includeOutOfNetwork: boolean;
}

export interface FeedPreferencesResponse {
  preferences: FeedPreferences;
  defaults: FeedPreferences;
  topics: Array<{
    topic: string;
    weight: number;
    isPinned: boolean;
    isMuted: boolean;
  }>;
}

export interface Thread {
  root: Post;
  replies: Post[];
}

export interface ExploreResult {
  posts: Post[];
  people: ProfileSummary[];
  brands: ProfileSummary[];
  products: Array<{
    id: string;
    title: string;
    priceMinor?: string;
    currency: string;
    imageUrl?: string;
    profileId: string;
  }>;
  courses: Array<{
    id: string;
    slug: string;
    title: string;
    summary?: string;
    coverUrl?: string;
    level: string;
  }>;
  live: Array<{
    id: string;
    channelKey: string;
    title?: string;
    viewersCount: number;
    profileId: string;
  }>;
  topics: Array<{ topic: string; count: number }>;
}

export interface CalendarItem {
  id: string;
  kind: PostKind;
  status: PostStatus;
  title: string;
  at: string;
  visibility: Visibility;
  externalPlatforms: string[];
}

export interface CreatorAnalytics {
  profileId: string;
  rangeDays: number;
  impressions: number;
  reach: number;
  interactions: number;
  shares: number;
  profileVisits: number;
  followersGained: number;
  engagementRate: number;
  earningsMinor: string;
  currency: string;
  daily: Array<{
    date: string;
    impressions: number;
    interactions: number;
    followers: number;
  }>;
  topPosts: Array<{
    id: string;
    body: string;
    impressions: number;
    interactions: number;
    engagementRate: number;
    publishedOn: string | null;
  }>;
}

export interface Balance {
  availableMinor: string;
  pendingMinor: string;
  currency: string;
  lifetimeEarnedMinor: string;
}

export interface StreamSummary {
  id: string;
  channelKey: string;
  status: string;
  title?: string;
  category?: string;
  owner: ProfileSummary;
  viewersCount: number;
  startedOn?: string | null;
  thumbnailUrl?: string;
  playback: { hlsUrl: string; llHlsUrl: string; whepUrl: string };
  chatEnabled: boolean;
}

/**
 * A category with someone live in it.
 *
 * Ranked by viewers rather than channel count, the way every live directory
 * does it: one channel with ten thousand watching is a bigger category than
 * twelve with none.
 */
export interface LiveCategory {
  category: string;
  count: number;
  viewers: number;
}

export interface StreamIngest {
  rtmpUrl: string;
  srtUrl: string;
  whipUrl: string;
  streamKey: string;
  obsDeepLink: string;
  recommendedSettings: Array<{
    name: string;
    height: number;
    videoBitrateKbps: number;
    audioBitrateKbps: number;
    framerate?: number;
  }>;
  /** False when this deployment has no media server configured. */
  configured: boolean;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  level: string;
  topics: string[];
  coverUrl?: string;
  estimatedMinutes: number;
  certificationTitle?: string;
  enrollmentsCount: number;
  priceMinor: string | null;
  currency: string;
}

export interface Lesson {
  id: string;
  title: string;
  kind: "article" | "video" | "quiz";
  position: number;
  body?: string;
  videoUrl?: string;
  estimatedMinutes: number;
  questions?: Array<{
    prompt: string;
    options: string[];
    /** -1 when the answer key is withheld, which it is until you pass. */
    correctIndex: number;
    explanation?: string;
  }>;
}

export interface CourseDetail {
  course: CourseSummary & {
    description?: string;
    passingScore: number;
    completionsCount: number;
  };
  lessons: Lesson[];
  enrollment: {
    status: string;
    progressPercent: number;
    completedLessonIds: string[];
    quizScore?: number;
    completedOn?: string | null;
  } | null;
}

export interface Conversation {
  id: string;
  kind: string;
  title?: string;
  participants: ProfileSummary[];
  lastMessagePreview?: string;
  lastMessageOn?: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: ProfileSummary;
  body?: string;
  sharedPost?: Post | null;
  media?: Array<{ url: string; kind: string }> | null;
  createdOn: string;
}

export interface ComposeInput {
  kind: PostKind;
  title?: string;
  body?: string;
  visibility?: Visibility;
  media?: Array<{
    kind: MediaKind;
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    width?: number;
    height?: number;
    duration?: number;
  }>;
  pollOptions?: string[];
  pollClosesInHours?: number;
  parentId?: string;
  repostOfId?: string;
  attachmentKind?: AttachmentKind;
  attachmentTargetId?: string;
  place?: { name: string; latitude?: number; longitude?: number };
  productIds?: string[];
  topics?: string[];
  tags?: string[];
  isSponsored?: boolean;
  disclosure?: DisclosureKind;
  sponsorProfileId?: string;
  scheduledFor?: string | null;
  publish?: boolean;
  externalPlatforms?: string[];
  music?: {
    id: string;
    name: string;
    artist?: string;
    previewUrl?: string;
  };
}

/** Client-reported signals. Batched, clamped and capped server-side. */
export type EngagementKind =
  | "impression"
  | "dwell"
  | "click"
  | "video_watch"
  | "profile_visit";

export interface EngagementSignal {
  subjectId: string;
  subjectKind: string;
  kind: EngagementKind;
  value?: number;
  surface?: string;
  position?: number;
}
