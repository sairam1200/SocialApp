
// src/middleware.ts

import {
	NextRequest,
	NextResponse,
} from "next/server";
import {
	AUTH_PAGES,
	isProtectedPath,
} from "@/constants/routes";

/**
 * ---------------------------------------------------
 * COOKIE NAMES
 * ---------------------------------------------------
 */

const ACCESS_TOKEN_COOKIE =
	"access_token";

/**
 * ---------------------------------------------------
 * CHECK JWT EXPIRATION
 * ---------------------------------------------------
 */

function isTokenExpired(
	token: string
): boolean {
	try {
		const parts = token.split(".");

		if (parts.length !== 3) {
			return true;
		}

		const payload = parts[1]
			.replace(/-/g, "+")
			.replace(/_/g, "/");

		const padded =
			payload +
			"=".repeat(
				(4 - (payload.length % 4)) %
				4
			);

		const json = atob(padded);

		const decoded = JSON.parse(json) as {
			exp?: number;
		};

		if (!decoded.exp) {
			return true;
		}

		const now = Math.floor(
			Date.now() / 1000
		);

		return decoded.exp <= now;
	} catch {
		return true;
	}
}
/**
 * ---------------------------------------------------
 * VERIFY SESSION WITH BACKEND
 * ---------------------------------------------------
 */

async function verifySession(
	token: string,
	request: NextRequest
): Promise<"valid" | "invalid" | "unavailable"> {
	try {
		const authApiUrl = process.env.AUTH_API_URL || "http://localhost:8080";
		const response = await fetch(
			`${authApiUrl.replace(/\/$/, "")}/api/v1/auth/current`,
			{
				method: "GET",

				headers: {
					Authorization: `Bearer ${token}`,

					Cookie: `access_token=${request.cookies.get("access_token")?.value || ""}`,
				},

				cache: "no-store",
			}
		);

		if (response.ok) return "valid";
		if (response.status === 401 || response.status === 403) return "invalid";
		return "unavailable";
	} catch {
		return "unavailable";
	}
}

/**
 * ---------------------------------------------------
 * REDIRECT TO LOGIN
 * ---------------------------------------------------
 */

function redirectToLogin(
	request: NextRequest,
	pathname: string,
	search: string,
	error?: string
) {
	const loginUrl = new URL(
		"/login",
		request.url
	);

	loginUrl.searchParams.set(
		"redirect",
		`${pathname}${search}`
	);

	if (error) {
		loginUrl.searchParams.set(
			"error",
			error
		);
	}

	const response =
		NextResponse.redirect(loginUrl);

	response.cookies.delete(
		ACCESS_TOKEN_COOKIE
	);

	return response;
}

/**
 * ---------------------------------------------------
 * MAIN MIDDLEWARE
 * ---------------------------------------------------
 */

export async function proxy(
	request: NextRequest
) {
	const token =
		request.cookies.get(
			ACCESS_TOKEN_COOKIE
		)?.value;
	const { pathname, search } =
		request.nextUrl;

	const isProtectedPage = isProtectedPath(pathname);

	const isAuthPage = AUTH_PAGES.some(
		(route) =>
			pathname === route ||
			pathname.startsWith(
				`${route}/`
			)
	);

	/**
	 * -----------------------------------------------
	 * PROTECTED ROUTES
	 * -----------------------------------------------
	 */

	if (isProtectedPage) {
		// No token
		if (!token) {
			return redirectToLogin(
				request,
				pathname,
				search
			);
		}

		// Let the client refresh an expired access token with its still-valid
		// httpOnly refresh cookie. Redirecting here made the refresh flow
		// unreachable and destructively deleted the session cookie.
		const sessionStatus = isTokenExpired(token)
			? "unavailable"
			: await verifySession(token, request);

		// Only an authoritative auth rejection destroys local session state.
		// Timeouts, 5xx responses and cold starts allow the request through so a
		// transient backend failure does not become a forced logout.
		if (sessionStatus === "invalid") {
			return redirectToLogin(
				request,
				pathname,
				search,
				"session_invalid"
			);
		}
	}
	/**
		 * -----------------------------------------------
		 * AUTH PAGES
		 * -----------------------------------------------
		 */

	if (
		token &&
		isAuthPage &&
		!isTokenExpired(token)
	) {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`,
				{
					headers: {
						cookie:
							request.headers.get(
								"cookie"
							) || "",
					},
					cache: "no-store",

				}
			);
			if (response.ok) {
				const session =
					await response.json();

				const onboardingStep =
					session?.user
						?.onboardingStep;

				if (
					onboardingStep !==
					"Completed"
				) {
					return NextResponse.redirect(
						new URL(
							"/onboarding",
							request.url
						)
					);
				}

				return NextResponse.redirect(
					new URL(
						"/discover",
						request.url
					)
				);
			}
		} catch {
		}
	}

	/**
	 * -----------------------------------------------
	 * ALLOW REQUEST
	 * -----------------------------------------------
	 */
	const requestHeaders = new Headers(
		request.headers
	);

	requestHeaders.set(
		"x-pathname",
		request.nextUrl.pathname
	);
	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}

/**
 * ---------------------------------------------------
 * MATCHER
 * ---------------------------------------------------
 */

export const config = {
	matcher: [
		"/settings/:path*",
		"/analytics/:path*",
		"/bookmarks/:path*",
		"/collections/:path*",
		"/admin/:path*",
		"/community/messages/:path*",

		"/login",
		"/signup",
		"/forgot-password",
	],
};

