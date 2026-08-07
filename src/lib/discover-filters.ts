import type { DiscoverContentModel } from "@/types/discover.type";

export type ContentTypeCategory = "feed_post" | "reels_shorts" | "live_stream" | "igtv_long_form";

export function getContentCategory(item: DiscoverContentModel): ContentTypeCategory {
  const t = item?.type?.toLowerCase() || "";

  if (t.includes("live")) return "live_stream";
  if (t.includes("reel") || t.includes("short") || t === "animated_gif") return "reels_shorts";
  if (t === "uploaded_video" || t === "subscription_video" || t === "playlist_video") return "igtv_long_form";
  if (t === "video" || t === "VIDEO") {
    if (item.platform === "youtube") return "igtv_long_form";
    return "reels_shorts";
  }

  return "feed_post";
}

export function filterByPlatform(items: DiscoverContentModel[], platforms: string[]): DiscoverContentModel[] {
  if (platforms.length === 0) return items;
  return items.filter((item) => platforms.includes(item.platform));
}

export function filterByContentType(items: DiscoverContentModel[], types: string[]): DiscoverContentModel[] {
  if (types.length === 0) return items;
  return items.filter((item) => item && types.includes(getContentCategory(item)));
}

export function filterByDatePosted(items: DiscoverContentModel[], datePosted: string): DiscoverContentModel[] {
  if (!datePosted || datePosted === "anytime") return items;
  const now = Date.now();
  const cutoff = datePosted === "past_week"
    ? now - 7 * 24 * 60 * 60 * 1000
    : now - 30 * 24 * 60 * 60 * 1000;
  return items.filter((item) => {
    const ts = item.publishedAt ? new Date(item.publishedAt).getTime() : 0;
    return ts >= cutoff;
  });
}

export function sortByMetrics(items: DiscoverContentModel[], metrics: string[]): DiscoverContentModel[] {
  if (metrics.length === 0) return items;
  const sorted = [...items];
  sorted.sort((a, b) => {
    for (const m of metrics) {
      let diff = 0;
      if (m === "highest_liked") diff = (b.likes ?? 0) - (a.likes ?? 0);
      else if (m === "most_commented") diff = (b.comments ?? 0) - (a.comments ?? 0);
      else if (m === "most_views") diff = (b.views ?? 0) - (a.views ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });
  return sorted;
}
