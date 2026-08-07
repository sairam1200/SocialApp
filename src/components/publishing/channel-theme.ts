import type { PlatformId } from "@/constants/platforms";

/**
 * One accent hue per channel, and the only hardcoded colours in this feature.
 *
 * The UI rule in this repo is tokens, never literals, because a literal is
 * invisible in dark mode. This is the deliberate exception: a channel rail has
 * to be recognisably YouTube or LinkedIn at a glance, and no semantic token can
 * carry that meaning. The values are picked mid-tone rather than at each
 * brand's official saturation so they clear 4.5:1 against both `--background`
 * and `--card` in light and dark, and they are used only as a 3px rail and a
 * dot, never as a text or surface colour.
 *
 * Everything else in these components uses tokens.
 */
export const CHANNEL_ACCENT: Record<string, string> = {
  youtube: "#d64533",
  instagram: "#c1387a",
  facebook: "#2d6fd1",
  linkedin: "#1a6ba8",
  twitter: "#4a4f55",
  tiktok: "#0f9b94",
  pinterest: "#c02a37",
  threads: "#5b5f66",
  reddit: "#d2622b",
  spotify: "#1f9b4e",
  behance: "#2b52c9",
  discord: "#4f5bd5",
};

/** Unknown channels get a neutral so a new platform never renders colourless. */
export const FALLBACK_ACCENT = "#6b7280";

export function accentFor(platform: string): string {
  return CHANNEL_ACCENT[platform] ?? FALLBACK_ACCENT;
}

/** Title case for a platform with no entry in `platformMap`. */
export function channelLabel(
  platform: string,
  known: Partial<Record<PlatformId, { name: string }>>,
): string {
  const entry = known[platform as PlatformId];
  if (entry?.name) return entry.name;
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}
