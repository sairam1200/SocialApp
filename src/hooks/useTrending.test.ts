import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadTrending, mapTrendingSearchResponse } from "./useTrending";
import type { TrendingSearchApiResponse } from "@/services/api/search.service";

const { getPersonalizedTrendingSearch, getTrendingSearch } = vi.hoisted(() => ({
  getPersonalizedTrendingSearch: vi.fn(),
  getTrendingSearch: vi.fn(),
}));

vi.mock("@/services/apiClient.service", () => ({
  apiClient: {
    Search: {
      getPersonalizedTrendingSearch,
      getTrendingSearch,
    },
  },
}));

const personalizedResponse: TrendingSearchApiResponse = {
  generatedAt: "2026-08-04T18:30:00.000Z",
  stale: false,
  windowHours: 48,
  refreshIntervalSeconds: 300,
  personalization: {
    mode: "personalized",
    interestTopicCount: 1,
    location: { countryCode: "IN", regionCode: "TN" },
  },
  items: [
    {
      rank: 1,
      query: "Indian Music",
      normalizedQuery: "indian music",
      score: 7.123456,
      searchCount: 5,
      uniqueSearchers: 4,
      lastSearchedAt: "2026-08-04T18:29:00.000Z",
      reasonCodes: [
        "global-trending",
        "matches-your-interests",
        "trending-in-your-country",
      ],
    },
  ],
};

describe("owner-personalized trending", () => {
  beforeEach(() => {
    getPersonalizedTrendingSearch.mockReset();
    getTrendingSearch.mockReset();
  });

  it("uses the authenticated route even when Discover enables guest fixtures", async () => {
    getPersonalizedTrendingSearch.mockResolvedValue(personalizedResponse);

    const response = await loadTrending(true, true);

    expect(getPersonalizedTrendingSearch).toHaveBeenCalledWith(10);
    expect(getTrendingSearch).not.toHaveBeenCalled();
    expect(response.items).toEqual([
      expect.objectContaining({
        title: "Indian Music",
        trendScore: 7.12,
        href: "/discover?q=Indian%20Music",
      }),
    ]);
  });

  it("retains the existing guest fixtures without making an authenticated call", async () => {
    const response = await loadTrending(false, true);

    expect(response.items).toHaveLength(5);
    expect(getPersonalizedTrendingSearch).not.toHaveBeenCalled();
    expect(getTrendingSearch).not.toHaveBeenCalled();
  });

  it("uses the public route when fixtures are disabled for a guest", async () => {
    getTrendingSearch.mockResolvedValue({
      ...personalizedResponse,
      personalization: { mode: "global", interestTopicCount: 0 },
    });

    await loadTrending(false, false);

    expect(getTrendingSearch).toHaveBeenCalledWith(10);
    expect(getPersonalizedTrendingSearch).not.toHaveBeenCalled();
  });

  it("keeps startup fixtures visible after login until live data exists", async () => {
    getPersonalizedTrendingSearch.mockResolvedValue({
      ...personalizedResponse,
      items: [],
    });

    const response = await loadTrending(true, true);

    expect(response.items).toHaveLength(5);
    expect(response.items[0]).toEqual(
      expect.objectContaining({ title: "#TechTrends2025" }),
    );
  });

  it("maps only display-safe fields into the existing card contract", () => {
    const mapped = mapTrendingSearchResponse(personalizedResponse);
    const serialized = JSON.stringify(mapped);

    expect(mapped.timestamp).toBe(personalizedResponse.generatedAt);
    expect(serialized).not.toContain("countryCode");
    expect(serialized).not.toContain("regionCode");
    expect(serialized).not.toContain("reasonCodes");
  });
});
