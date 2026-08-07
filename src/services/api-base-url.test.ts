import { describe, expect, it } from "vitest";
import { API_BASE_URL } from "./apiClient.service";

/**
 * The base URL every request is built from.
 *
 * This existed as `` `${process.env.NEXT_PUBLIC_API_BASE_URL}` ``, so a build
 * without the variable produced the *string* `"undefined"` and every call went
 * to `/undefined/community/feed` — resolved relative to whatever page you were
 * on, so it 404'd quietly, differently per route, and never once said why.
 *
 * It cost a full end-to-end suite: 78 tests failed against a build made
 * without that variable, and the cause looked like a feature bug.
 */
describe("API_BASE_URL", () => {
	it("is never the string 'undefined'", () => {
		expect(API_BASE_URL).not.toContain("undefined");
	});

	it("is a usable base — an absolute URL or a rooted path", () => {
		// A rooted path is deliberate: `next.config.ts` rewrites `/api/v1/*` to
		// the backend, so same-origin works with no configuration at all.
		expect(API_BASE_URL).toMatch(/^(https?:\/\/|\/)/);
	});
});
