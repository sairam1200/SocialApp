export const queryKeys = {
  userProfile: (username: string) => ["user", "profile", username] as const,
  discoverCreators: (page: number, limit: number) => ["discover", "creators", page, limit] as const,
  discoverFeed: (userId?: string, viewerUserId?: string) =>
    ["discover", "feed", userId ?? "all", viewerUserId ?? "guest"] as const,
  searchResults: (query: string, page: number, limit: number) => ["search", "results", query, page, limit] as const,
  searchProjects: (query: string, page: number, limit: number) => ["projects", "search", query, page, limit] as const,
  searchJobs: (
    query: string,
    status: string,
    jobType: string,
    locationType: string,
    page: number,
    limit: number,
  ) => ["jobs", "search", query, status, jobType, locationType, page, limit] as const,
  discoverJobs: (query: string, page: number, limit: number) => ["jobs", "discover", query, page, limit] as const,
  followStatus: (userId: string) => ["follow", "status", userId] as const,
  publishStatus: (publishJobId: string) => ["publish", "status", publishJobId] as const,
  publishCapabilities: () => ["publish", "capabilities"] as const,
  // The range is part of the key, so paging the calendar back a month is a
  // different cache entry rather than a refetch that overwrites the current one.
  publishCalendar: (from: string, to: string, platforms: string[]) =>
    ["publish", "calendar", from, to, [...platforms].sort().join(",")] as const,
  publishQueue: (statuses: string[], platforms: string[], offset: number) =>
    [
      "publish",
      "queue",
      [...statuses].sort().join(","),
      [...platforms].sort().join(","),
      offset,
    ] as const,
  publishChannels: () => ["publish", "channels"] as const,
  generationStatus: () => ["generate", "status"] as const,
};
