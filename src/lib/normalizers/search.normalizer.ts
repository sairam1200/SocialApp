import {
  SearchResult,
  SearchTypeTab,
  UnifiedSearchContentItem,
} from "@/types/search.types";
import { normalizeSearchResultProject } from "./project.normalizer";

export interface HybridNormalizedResults {
  results: SearchResult[];
  profilesTotal: number;
  contentsTotal: number;
  projectsTotal: number;
}

function classifyBackendType(
  item: UnifiedSearchContentItem,
): SearchTypeTab {
  const t = item.type?.toLowerCase();
  if (t === "profile") return "profiles";
  if (t === "project") return "projects";
  return "contents";
}

export function normalizeHybridResults(
  items: UnifiedSearchContentItem[],
): HybridNormalizedResults {
  const results: SearchResult[] = [];
  let profilesTotal = 0;
  let contentsTotal = 0;
  let projectsTotal = 0;

  // TODO: REMOVE AFTER SEARCH DEBUGGING
  if (process.env.NODE_ENV === 'development') {
    console.log('[SEARCH DEBUG]');
    console.log('Normalizer Input');
    console.log(`Total: ${items.length}`);
  }

  for (const item of items) {
    const category = classifyBackendType(item);

    if (category === "projects") {
      results.push(normalizeSearchResultProject(item));
      projectsTotal++;
      continue;
    }

    if (category === "profiles") {
      const name = item.creatorName || "";
      results.push({
        id: item.id,
        type: "profile",
        platform: item.platform,
        title: name,
        description: item.description,
        externalId: item.externalId,
        author: {
          name: name,
          handle: item.creatorUsername || undefined,
          profileImage: item.creatorAvatar || undefined,
        },
        engagement: {
          views: item.engagement?.viewCount ?? null,
          likes: item.engagement?.likeCount ?? null,
        },
        publishedAt: item.publishedAt,
        publicProfile: item.platformMetadata,
      });
      profilesTotal++;
      continue;
    }

    const type = item.type?.toLowerCase();
    results.push({
      id: item.id,
      type: type === "video" ? "video" : "content",
      platform: item.platform,
      title: item.title,
      description: item.description,
      externalId: item.externalId,
      url: item.platformMetadata?.sourceUrl ?? item.platformMetadata?.url,
      publishedAt: item.publishedAt,
      author: {
        name: item.creatorName,
        handle: item.creatorUsername || undefined,
        profileImage: item.creatorAvatar || undefined,
      },
      media: {
        type: type === "video" ? "video" : "image",
        thumbnailUrl: item.thumbnailUrl || undefined,
        url: item.mediaUrl || undefined,
      },
      engagement: {
        views: item.engagement?.viewCount ?? null,
        likes: item.engagement?.likeCount ?? null,
        comments: item.engagement?.commentCount ?? null,
        shares: item.engagement?.shareCount ?? null,
      },
    });
    contentsTotal++;
  }

  // TODO: REMOVE AFTER SEARCH DEBUGGING
  if (process.env.NODE_ENV === 'development') {
    console.log('[SEARCH DEBUG]');
    console.log(`Profiles: ${profilesTotal}`);
    console.log(`Contents: ${contentsTotal}`);
    console.log(`Projects: ${projectsTotal}`);
    if (items.length !== results.length) {
      console.log('[SEARCH DEBUG]');
      console.log('Skipped');
      const skipped = items.length - results.length;
      items.forEach((item, _idx) => {
        const cat = classifyBackendType(item);
        if (!cat) {
          console.log(`id: ${item.id}`);
          console.log(`type: ${item.type}`);
          console.log('Reason: Unknown type');
        }
      });
    }
  }

  return { results, profilesTotal, contentsTotal, projectsTotal };
}
