export type FeatureStatus = "completed" | "partial" | "planned" | "not_started";

export interface PlatformFeature {
  id: string;
  category: string;
  title: string;
  description: string;
  status: FeatureStatus;
  weight: number;
  notes?: string;
  hidden?: boolean;
}

const features: PlatformFeature[] = [
  // ── Authentication ──
  {
    id: "email-login",
    category: "Authentication",
    title: "Email Login",
    description: "Sign in with email and password credentials.",
    status: "completed",
    weight: 5,
  },
  {
    id: "email-signup",
    category: "Authentication",
    title: "Email Signup",
    description: "Create an account with email, username, and password.",
    status: "completed",
    weight: 5,
  },
  {
    id: "google-oauth",
    category: "Authentication",
    title: "Google OAuth",
    description: "Sign in and sign up using a Google account.",
    status: "completed",
    weight: 5,
  },
  {
    id: "facebook-oauth",
    category: "Authentication",
    title: "Facebook OAuth",
    description: "Sign in using a Facebook account. Requires Meta Test Users for development.",
    status: "partial",
    weight: 5,
    notes: "Requires Meta Test Users for development",
  },
  {
    id: "forgot-password",
    category: "Authentication",
    title: "Forgot Password",
    description: "Request a password reset link via email.",
    status: "completed",
    weight: 3,
  },
  {
    id: "reset-password",
    category: "Authentication",
    title: "Reset Password",
    description: "Set a new password using a secure reset token.",
    status: "completed",
    weight: 3,
  },
  {
    id: "email-verification",
    category: "Authentication",
    title: "Email Verification",
    description: "Verify email address after signup via confirmation link.",
    status: "completed",
    weight: 3,
  },
  {
    id: "two-factor-auth",
    category: "Authentication",
    title: "Two-Factor Authentication",
    description: "Enable or disable 2FA for enhanced account security.",
    status: "completed",
    weight: 5,
  },
  {
    id: "account-deletion",
    category: "Authentication",
    title: "Account Deletion",
    description: "Permanently delete or deactivate account with recovery options.",
    status: "completed",
    weight: 3,
  },

  // ── Onboarding ──
  {
    id: "interactive-onboarding",
    category: "Onboarding",
    title: "Interactive Onboarding",
    description: "Multi-step onboarding flow guiding new users through setup, social connections, and preferences.",
    status: "completed",
    weight: 10,
  },

  // ── Discover ──
  {
    id: "discover-feed",
    category: "Discover",
    title: "Discover Feed",
    description: "Curated feed of creators and content with cursor-based pagination.",
    status: "completed",
    weight: 10,
  },
  {
    id: "discover-filters",
    category: "Discover",
    title: "Platform Filters",
    description: "Filter discover feed results by social platform.",
    status: "completed",
    weight: 5,
  },
  {
    id: "infinite-scroll",
    category: "Discover",
    title: "Infinite Scroll",
    description: "Seamless pagination with automatic content loading as the user scrolls.",
    status: "completed",
    weight: 5,
  },
  {
    id: "creator-discovery",
    category: "Discover",
    title: "Creator Discovery",
    description: "Discover and browse creators across connected platforms.",
    status: "completed",
    weight: 5,
  },

  // ── Search ──
  {
    id: "global-search",
    category: "Search",
    title: "Global Search",
    description: "Search across all platforms and users with a single query.",
    status: "completed",
    weight: 10,
  },
  {
    id: "platform-search",
    category: "Search",
    title: "Platform-specific Search",
    description: "Filter search results by individual social platforms.",
    status: "completed",
    weight: 5,
  },
  {
    id: "trending",
    category: "Search",
    title: "Trending Content",
    description: "Discover trending content and popular searches.",
    status: "completed",
    weight: 5,
  },
  {
    id: "search-suggestions",
    category: "Search",
    title: "Search Suggestions",
    description: "Auto-complete and suggested search terms as the user types.",
    status: "completed",
    weight: 3,
  },

  // ── Profiles ──
  {
    id: "view-profile",
    category: "Profiles",
    title: "View Profile",
    description: "Display user profile with connected accounts and aggregated content.",
    status: "completed",
    weight: 10,
  },
  {
    id: "edit-profile",
    category: "Profiles",
    title: "Edit Profile",
    description: "Update profile information, bio, and personal details.",
    status: "completed",
    weight: 5,
  },
  {
    id: "profile-picture-upload",
    category: "Profiles",
    title: "Profile Picture Upload",
    description: "Upload and set a profile photo.",
    status: "completed",
    weight: 3,
  },
  {
    id: "profile-picture-crop",
    category: "Profiles",
    title: "Profile Picture Crop",
    description: "Crop and adjust profile picture before saving.",
    status: "completed",
    weight: 3,
  },
  {
    id: "profile-privacy",
    category: "Profiles",
    title: "Profile Privacy Settings",
    description: "Control visibility of profile information and connected accounts.",
    status: "completed",
    weight: 5,
  },
  {
    id: "guest-profile-viewing",
    category: "Profiles",
    title: "Guest Profile Viewing",
    description: "View public profiles without being signed in.",
    status: "completed",
    weight: 5,
  },

  // ── Platform Integrations ──
  {
    id: "youtube-integration",
    category: "Platform Integrations",
    title: "YouTube Integration",
    description: "Full OAuth connection, content import, analytics dashboard, and video upload.",
    status: "completed",
    weight: 10,
  },
  {
    id: "pinterest-integration",
    category: "Platform Integrations",
    title: "Pinterest Integration",
    description: "OAuth connection and content synchronization.",
    status: "completed",
    weight: 10,
  },
  {
    id: "facebook-integration",
    category: "Platform Integrations",
    title: "Facebook Integration",
    description: "OAuth connection and analytics dashboard. Requires Meta Test Users for development.",
    status: "partial",
    weight: 10,
    notes: "Requires Meta Test Users for development",
  },
  {
    id: "instagram-integration",
    category: "Platform Integrations",
    title: "Instagram Integration",
    description: "OAuth connection flow implemented. Requires Meta Test Users for full testing.",
    status: "partial",
    weight: 10,
    notes: "Requires Meta Test Users for development",
  },
  {
    id: "twitter-integration",
    category: "Platform Integrations",
    title: "Twitter/X Integration",
    description: "OAuth connection established. Content synchronization is not yet implemented.",
    status: "partial",
    weight: 10,
    notes: "OAuth implemented, content sync pending",
  },
  {
    id: "linkedin-integration",
    category: "Platform Integrations",
    title: "LinkedIn Integration",
    description: "OAuth connection established. Content synchronization is not yet implemented.",
    status: "partial",
    weight: 10,
    notes: "OAuth implemented, content sync pending",
  },
  {
    id: "tiktok-integration",
    category: "Platform Integrations",
    title: "TikTok Integration",
    description: "Planned integration. No OAuth credentials configured yet.",
    status: "not_started",
    weight: 10,
    notes: "No API credentials",
  },
  {
    id: "reddit-integration",
    category: "Platform Integrations",
    title: "Reddit Integration",
    description: "Planned integration. No OAuth credentials configured yet.",
    status: "not_started",
    weight: 5,
    notes: "No API credentials",
  },
  {
    id: "spotify-integration",
    category: "Platform Integrations",
    title: "Spotify Integration",
    description: "Manual link only. No OAuth credentials configured.",
    status: "not_started",
    weight: 5,
    notes: "Manual link only",
  },
  {
    id: "behance-integration",
    category: "Platform Integrations",
    title: "Behance Integration",
    description: "Manual link only. No OAuth credentials configured.",
    status: "not_started",
    weight: 3,
    notes: "Manual link only",
  },
  {
    id: "discord-integration",
    category: "Platform Integrations",
    title: "Discord Integration",
    description: "Manual link only. No OAuth credentials configured.",
    status: "not_started",
    weight: 3,
    notes: "Manual link only",
  },

  // ── Social ──
  {
    id: "follow-users",
    category: "Social",
    title: "Follow/Unfollow Users",
    description: "Follow and unfollow other users with optimistic UI updates.",
    status: "completed",
    weight: 5,
  },
  {
    id: "following-feed",
    category: "Social",
    title: "Following Feed",
    description: "View content from users you follow.",
    status: "completed",
    weight: 5,
  },
  {
    id: "followers-list",
    category: "Social",
    title: "Followers List",
    description: "View and manage your followers.",
    status: "completed",
    weight: 3,
  },
  {
    id: "real-time-follow-updates",
    category: "Social",
    title: "Real-time Follow Updates",
    description: "WebSocket-powered instant follow/unfollow notifications.",
    status: "completed",
    weight: 3,
  },
  {
    id: "profile-cards",
    category: "Social",
    title: "Profile Cards",
    description: "Rich profile cards showing connected platforms, follower counts, and content previews.",
    status: "completed",
    weight: 5,
  },

  // ── Settings ──
  {
    id: "change-email",
    category: "Settings",
    title: "Change Email",
    description: "Update the email address associated with your account.",
    status: "completed",
    weight: 3,
  },
  {
    id: "change-password",
    category: "Settings",
    title: "Change Password",
    description: "Update account password with current password verification.",
    status: "completed",
    weight: 3,
  },
  {
    id: "connected-accounts",
    category: "Settings",
    title: "Connected Accounts Management",
    description: "View, add, and remove connected social media accounts.",
    status: "completed",
    weight: 5,
  },
  {
    id: "blocked-accounts",
    category: "Settings",
    title: "Manage Blocked Accounts",
    description: "View and unblock users you have blocked.",
    status: "completed",
    weight: 3,
  },
  {
    id: "recovery-email",
    category: "Settings",
    title: "Recovery Email",
    description: "Set up a recovery email for account recovery.",
    status: "completed",
    weight: 3,
  },
  {
    id: "recovery-phone",
    category: "Settings",
    title: "Recovery Phone",
    description: "Set up a recovery phone number for account recovery.",
    status: "completed",
    weight: 3,
  },
  {
    id: "recovery-codes",
    category: "Settings",
    title: "Recovery Codes",
    description: "Generate and manage one-time recovery codes for 2FA.",
    status: "completed",
    weight: 3,
  },
  {
    id: "notifications-settings",
    category: "Settings",
    title: "Notifications Settings",
    description: "Configure notification preferences and delivery methods.",
    status: "completed",
    weight: 5,
  },
  {
    id: "language-settings",
    category: "Settings",
    title: "Language Settings",
    description: "Change the application interface language.",
    status: "completed",
    weight: 3,
  },
  {
    id: "accent-theme",
    category: "Settings",
    title: "Accent Theme Customization",
    description: "Customize the accent color theme (default, blue, teal, purple, sunset).",
    status: "completed",
    weight: 3,
  },

  // ── Analytics ──
  {
    id: "youtube-analytics",
    category: "Analytics",
    title: "YouTube Analytics Dashboard",
    description: "Comprehensive analytics: overview, top videos, trends, daily views, watch time, subscriber growth, revenue, traffic sources, audience, geography, devices.",
    status: "completed",
    weight: 10,
  },
  {
    id: "facebook-analytics",
    category: "Analytics",
    title: "Facebook Analytics",
    description: "Page analytics: overview, top posts, top videos, follower trends.",
    status: "completed",
    weight: 10,
  },
  {
    id: "analytics-filters",
    category: "Analytics",
    title: "Analytics Filters",
    description: "Platform selector and date range filtering for analytics data.",
    status: "completed",
    weight: 5,
  },

  // ── Create Post ──
  {
    id: "create-post",
    category: "Create Post",
    title: "Multi-step Post Creation",
    description: "Create posts with compose, customize, and settings steps.",
    status: "completed",
    weight: 10,
  },
  {
    id: "platform-previews",
    category: "Create Post",
    title: "Platform-specific Previews",
    description: "Live preview of how posts will appear on Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, Reddit, and YouTube.",
    status: "completed",
    weight: 5,
  },
  {
    id: "media-upload",
    category: "Create Post",
    title: "Media Upload",
    description: "Upload images and videos with progress tracking and editing.",
    status: "completed",
    weight: 5,
  },
  {
    id: "youtube-video-upload",
    category: "Create Post",
    title: "YouTube Video Upload",
    description: "Upload videos directly to YouTube with chunked upload, progress, and status polling.",
    status: "completed",
    weight: 10,
  },

  // ── Real-time ──
  {
    id: "websocket-notifications",
    category: "Real-time",
    title: "WebSocket Notifications",
    description: "Real-time notification delivery via Socket.IO with read/unread state management.",
    status: "completed",
    weight: 5,
  },
  {
    id: "import-status",
    category: "Real-time",
    title: "Real-time Import Status",
    description: "Live tracking of content import progress across platforms.",
    status: "completed",
    weight: 5,
  },
  {
    id: "session-security-events",
    category: "Real-time",
    title: "Session Security Events",
    description: "Real-time force-logout, session alerts, and profile update events via WebSocket.",
    status: "completed",
    weight: 5,
  },

  // ── Future Features ──
  {
    id: "bookmarks",
    category: "Future Features",
    title: "Bookmarks",
    description: "Save and organize posts into collections. UI exists with basic drawer structure.",
    status: "partial",
    weight: 5,
    notes: "UI prototype implemented, backend integration pending",
  },
  {
    id: "cross-platform-publishing",
    category: "Future Features",
    title: "Cross-Platform Publishing",
    description: "Publish content to multiple platforms simultaneously from a single interface.",
    status: "partial",
    weight: 10,
    notes: "Create post UI and platform previews exist, actual publishing flow pending",
  },
  {
    id: "cover-image",
    category: "Future Features",
    title: "Cover Image",
    description: "Upload and customize profile cover/banner image.",
    status: "planned",
    weight: 3,
    notes: "Coming soon",
  },
  {
    id: "passwordless-auth",
    category: "Future Features",
    title: "Passwordless Authentication",
    description: "Sign in using magic links or one-time codes without a password.",
    status: "planned",
    weight: 3,
    notes: "Planned enhancement",
  },
];

export default features;

export function getCategories(): string[] {
  const cats = new Set(features.map((f) => f.category));
  const order = [
    "Authentication",
    "Onboarding",
    "Discover",
    "Search",
    "Profiles",
    "Platform Integrations",
    "Social",
    "Settings",
    "Analytics",
    "Create Post",
    "Real-time",
    "Future Features",
  ];
  return order.filter((c) => cats.has(c));
}

export function getFeaturesByCategory(category: string): PlatformFeature[] {
  return features.filter((f) => f.category === category && !f.hidden);
}

export function getStats() {
  const visible = features.filter((f) => !f.hidden);
  const totalWeight = visible.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = visible
    .filter((f) => f.status === "completed")
    .reduce((sum, f) => sum + f.weight, 0);
  const partialWeight = visible
    .filter((f) => f.status === "partial")
    .reduce((sum, f) => sum + f.weight, 0);
  const plannedWeight = visible
    .filter((f) => f.status === "planned")
    .reduce((sum, f) => sum + f.weight, 0);

  return {
    total: visible.length,
    completed: visible.filter((f) => f.status === "completed").length,
    partial: visible.filter((f) => f.status === "partial").length,
    planned: visible.filter((f) => f.status === "planned").length,
    notStarted: visible.filter((f) => f.status === "not_started").length,
    totalWeight,
    completedWeight,
    partialWeight,
    plannedWeight,
    completionPct:
      totalWeight > 0
        ? Math.round((completedWeight / totalWeight) * 100)
        : 0,
  };
}
