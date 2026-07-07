export const queryKeys = {
  userProfile: (username: string) => ["user", "profile", username] as const,
  discoverCreators: (page: number, limit: number) => ["discover", "creators", page, limit] as const,
  discoverFeed: (platform?: string, userId?: string) => ["discover", "feed", platform, userId] as const,
  searchResults: (query: string, page: number, limit: number) => ["search", "results", query, page, limit] as const,
  followStatus: (userId: string) => ["follow", "status", userId] as const,
};
