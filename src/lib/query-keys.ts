export const queryKeys = {
  userProfile: (username: string) => ["user", "profile", username] as const,
  discoverCreators: (page: number, limit: number) => ["discover", "creators", page, limit] as const,
  searchResults: (query: string, page: number, limit: number) => ["search", "results", query, page, limit] as const,
  followStatus: (userId: string) => ["follow", "status", userId] as const,
};
