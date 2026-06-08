// src/features/auth/lib/safeRedirect.ts

const DEFAULT_REDIRECT = "/discover";

export function getSafeRedirect(
	redirectPath?: string | null
) {
	if (
		redirectPath &&
		redirectPath.startsWith("/") &&
		!redirectPath.startsWith("//") &&
		!redirectPath.includes(":")
	) {
		return redirectPath;
	}

	return DEFAULT_REDIRECT;
}