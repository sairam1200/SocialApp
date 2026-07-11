
// src/middleware.ts

import {
	NextRequest,
	NextResponse,
} from "next/server";
import {
	AUTH_PAGES,
	PROTECTED_ROUTES,
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
): Promise<boolean> {
	try {
		const response = await fetch(
			`${process.env.AUTH_API_URL}/api/v1/auth/current`,
			{
				method: "GET",

				headers: {
					Authorization: `Bearer ${token}`,

					Cookie:
						request.headers.get(
							"cookie"
						) || "",
				},

				cache: "no-store",
			}
		);

		return response.ok;
	} catch (error) {
		console.error(
			"Auth verification failed:",
			error
		);

		// Backend unreachable
		return false;
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
	console.log(
		"ACCESS TOKEN EXISTS:",
		!!token
	);
	if (token) {
		console.log(
			"TOKEN LENGTH:",
			token.length
		);
	}
	const { pathname, search } =
		request.nextUrl;

	const isProtectedPage =
		PROTECTED_ROUTES.some(
			(route) =>
				pathname === route ||
				pathname.startsWith(
					`${route}/`
				)
		);

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

		if (isTokenExpired(token)) {

			console.log(
				"TOKEN EXPIRED",
				pathname
			);

			return redirectToLogin(
				request,
				pathname,
				search,
				"token_expired"
			);
		}

		// Verify backend session
		const start = Date.now();

		const isValidSession =
			await verifySession(token, request);

		console.log(
			"verifySession ms:",
			Date.now() - start
		);

		// Invalid session or backend unreachable
		if (!isValidSession) {
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
			console.log("AUTH PAGE HIT:", pathname);
			console.log("TOKEN EXISTS:", !!token);
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
		} catch (error) {
			console.error(
				"Session lookup failed",
				error
			);
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
		"/profile/:path*",

		"/login",
		"/signup",
		"/forgot-password",
	],
};

