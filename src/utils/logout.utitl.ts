// src/utils/logout.utitl.ts

"use server";

import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@/constants/globals";

export interface LogoutResult {
	success: boolean;
}

const AUTH_COOKIES = [
	"access_token",
	"refresh_token",
	"session",
	"better-auth.session_token",
	"__Secure-better-auth.session_token",
	COOKIE_NAMES.GOOGLE_ACCESS_TOKEN,
	COOKIE_NAMES.FACEBOOK_ACCESS_TOKEN,
	COOKIE_NAMES.INSTAGRAM_ACCESS_TOKEN,
	COOKIE_NAMES.TWITTER_ACCESS_TOKEN,
	COOKIE_NAMES.PINTEREST_ACCESS_TOKEN,
	COOKIE_NAMES.LINKEDIN_ACCESS_TOKEN,
	COOKIE_NAMES.TIKTOK_ACCESS_TOKEN,
];

export async function clearLocalSessionFn(): Promise<void> {
	const cookieStore = await cookies();
	AUTH_COOKIES.forEach((name) => cookieStore.delete(name));
}

export async function logoutFn(
	deviceId: string | null
): Promise<LogoutResult> {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
	if (!deviceId || !accessToken) {
		AUTH_COOKIES.forEach((name) => cookieStore.delete(name));
		return { success: false };
	}

	let remoteLogoutSucceeded = false;
	try {
		const backendOrigin = (
			process.env.AUTH_API_URL || "http://localhost:8080"
		).replace(/\/$/, "");
		const response = await fetch(`${backendOrigin}/api/v1/auth/logout`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				Authorization: `Bearer ${accessToken}`,
				Cookie: `${COOKIE_NAMES.ACCESS_TOKEN}=${encodeURIComponent(accessToken)}`,
			},
			body: JSON.stringify({ deviceId }),
			cache: "no-store",
		});
		remoteLogoutSucceeded = response.ok;
	} catch {
		remoteLogoutSucceeded = false;
	} finally {
		// Local credentials must not survive an upstream outage or a revoked
		// backend session. Provider revocation can be reconciled server-side.
		AUTH_COOKIES.forEach((name) => cookieStore.delete(name));
	}

	return { success: remoteLogoutSucceeded };
}
