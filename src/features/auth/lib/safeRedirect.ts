// src/features/auth/lib/safeRedirect.ts

const DEFAULT_REDIRECT = "/discover";

export function getSafeRedirect(
	redirectPath?: string | null
) {
	if (!redirectPath) return DEFAULT_REDIRECT;

	try {
		// Use URL parser to reject absolute URLs, protocol handlers, and auth bypasses.
		// A relative path like "/dashboard" parses with an empty origin;
		// "javascript:alert(1)" or "https://evil.com" will have a non-empty protocol.
		const parsed = new URL(redirectPath, "http://localhost");

		// Must be same-origin relative (no protocol, no host change)
		if (parsed.protocol !== "http:" || parsed.host !== "localhost") {
			return DEFAULT_REDIRECT;
		}

		// Re-encode to get the pathname+search+hash without the origin
		const safe = parsed.pathname + parsed.search + parsed.hash;

		// Must start with /, must not be //
		if (!safe.startsWith("/") || safe.startsWith("//")) {
			return DEFAULT_REDIRECT;
		}

		return safe;
	} catch {
		return DEFAULT_REDIRECT;
	}
}