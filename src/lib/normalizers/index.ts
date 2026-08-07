export { normalizeYoutubeContent } from "./platform/youtube.normalizer";
export { normalizeInstagramContent } from "./platform/instagram.normalizer";
export { normalizeFacebookContent } from "./platform/facebook.normalizer";
export { normalizeTiktokContent } from "./platform/tiktok.normalizer";
export { normalizeTwitterContent } from "./platform/twitter.normalizer";
export { normalizeLinkedInContent } from "./platform/linkedin.normalizer";
export { normalizeRedditContent } from "./platform/reddit.normalizer";
export { normalizePinterestContent } from "./platform/pinterest.normalizer";
export { normalizeGaddrContent } from "./platform/gaddr.normalizer";

export type { GaddrContentInput } from "./platform/gaddr.normalizer";

export {
  calculateContentCompleteness,
  isContentValid,
  filterValidContent,
  MIN_CONTENT_COMPLETENESS,
} from "./utils/normalization.utils";

export type {
  CardContentProps,
  StatItem,
  StatType,
  PlatformId,
} from "@/types/content-card.types";
