import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { COOKIE_NAMES } from "@/constants/globals";

interface AccessTokenPayload {
	exp?: number;
	sub?: string;
	nameid?: string;
}

/**
 * Is the caller signed in, as far as a Server Component can tell?
 *
 * Reads the `httpOnly` access-token cookie and checks its expiry locally. It
 * does **not** call the backend: a Server Component runs on every navigation,
 * and a network round trip there would put backend latency on first paint for
 * a question whose answer only decides which shell to render.
 *
 * Deliberately optimistic. Every actual permission is enforced by the API, so
 * the worst case for a wrong answer here is a signed-out reader briefly seeing
 * a composer that then fails — not a data leak. It is a rendering hint, and
 * must never be used as an authorisation check.
 *
 * Note the audit finding H5: `proxy.ts`'s `verifySession` returns `false` on a
 * network error and that path deletes the token cookie. This function makes no
 * network call at all, so it cannot contribute to that.
 */
export async function isSignedIn(): Promise<boolean> {
	try {
		const store = await cookies();
		const token = store.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
		if (!token) return false;

		const payload = jwtDecode<AccessTokenPayload>(token);
		if (!payload.exp) return true;
		return payload.exp > Math.floor(Date.now() / 1000);
	} catch {
		// A malformed token is not a signed-in user, and is not worth a 500.
		return false;
	}
}
