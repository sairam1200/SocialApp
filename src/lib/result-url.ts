/** Gaddr-owned hosts are first-party destinations, including product subdomains. */
export function isGaddrHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  return normalized === "gaddr.com" || normalized.endsWith(".gaddr.com");
}

const UUID_V4_AT_END = /(?:^|:)([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

/**
 * Search caches may contain the display result ID (`youtube:content:<uuid>`)
 * in the contentStreamId field. Engagement routes accept only the underlying
 * database UUID, so normalize that legacy/composite shape at the API boundary.
 */
export function normalizeContentStreamId(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.match(UUID_V4_AT_END)?.[1];
}

/**
 * Business-level external-link check for search results.
 *
 * Relative links, the current deployment, and every gaddr.com subdomain are
 * first-party. Other HTTP(S) hosts need an external marker and preview modal.
 */
export function isExternalResultUrl(
  value: string | null | undefined,
  currentOrigin?: string,
): boolean {
  if (!value || !/^https?:\/\//i.test(value)) return false;

  try {
    const url = new URL(value);
    if (isGaddrHost(url.hostname)) return false;
    if (currentOrigin && url.origin === new URL(currentOrigin).origin) return false;
    return true;
  } catch {
    return false;
  }
}

/** Allow only same-site relative paths and ordinary HTTP(S) destinations. */
export function isSafeResultUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Canonical Pinterest destination; `link` is often the pin's outbound website. */
export function pinterestResultUrl(
  externalId: string,
  subType?: string | null,
  metadata: Record<string, unknown> = {},
): string | undefined {
  const explicit = [metadata.permalink, metadata.permalink_url, metadata.externalUrl]
    .find((value): value is string =>
      typeof value === "string" && /^https?:\/\/(?:www\.)?pinterest\./i.test(value),
    );
  if (explicit) return explicit;

  const idFromUrl = externalId.match(/\/pin\/([^/?#]+)/i)?.[1];
  const cleanId = (idFromUrl ?? externalId).replace(/^pin:/i, "").trim();
  if (!cleanId) return undefined;

  if ((subType ?? "").toLowerCase() === "board") {
    const owner = metadata.ownerUserName ?? metadata.ownerUsername;
    const slug = metadata.boardSlug;
    if (typeof owner === "string" && typeof slug === "string") {
      return `https://www.pinterest.com/${owner}/${slug}/`;
    }
  }

  return `https://www.pinterest.com/pin/${encodeURIComponent(cleanId)}/`;
}
