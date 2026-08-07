const CLOUDFLARE_TEST_SITE_KEYS = new Set([
  "1x00000000000000000000AA",
  "2x00000000000000000000AB",
  "1x00000000000000000000BB",
  "2x00000000000000000000BB",
  "3x00000000000000000000FF",
]);

export function isTurnstileConfigurationSafe(
  siteKey: string | undefined,
  environment = process.env.NODE_ENV,
  allowTestKeys = process.env.NEXT_PUBLIC_TURNSTILE_ALLOW_TEST_KEYS === "true",
): boolean {
  if (!siteKey) return false;
  return (
    environment !== "production" ||
    allowTestKeys ||
    !CLOUDFLARE_TEST_SITE_KEYS.has(siteKey)
  );
}
