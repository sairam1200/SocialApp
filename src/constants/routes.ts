// src/constants/routes.ts

export const PROTECTED_ROUTES = [
	"/settings",
	"/analytics",
	"/publishing",
	"/bookmarks",
	"/collections",
	"/admin",
	"/community/messages",
];

export const isProtectedPath = (pathname: string): boolean =>
	PROTECTED_ROUTES.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);

export const ONBOARDING_INCOMPLETE_REDIRECT = "/onboarding";

export const AUTH_PAGES = [
	"/login",
	"/signup",
	"/forgot-password",
];
