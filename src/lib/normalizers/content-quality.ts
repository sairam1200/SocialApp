import type { CardContentProps } from "@/types/content-card.types";
import {
  calculateContentCompleteness,
  MIN_CONTENT_COMPLETENESS,
} from "./utils/normalization.utils";

export function isContentValid(content: CardContentProps): boolean {
  if (!content.userName || content.userName === "Unknown User" || !content.platform) return false;
  return calculateContentCompleteness(content) >= MIN_CONTENT_COMPLETENESS;
}

export function filterValidContent(items: CardContentProps[]): CardContentProps[] {
  return items.filter(isContentValid);
}

export { calculateContentCompleteness, MIN_CONTENT_COMPLETENESS } from "./utils/normalization.utils";
