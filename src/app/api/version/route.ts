import { NextResponse } from "next/server";

/**
 * What is actually deployed.
 *
 * This exists because answering "did that deploy?" required inferring the live
 * commit from the *contents of a 404 page* — grepping for a string only the
 * newest build could produce. That works once, by luck, and not at all for a
 * change with no visible surface.
 *
 * Vercel injects `VERCEL_GIT_COMMIT_SHA` into every build with no
 * configuration, so this works against the existing pipeline unchanged — which
 * matters, because the pipeline is the thing that is not currently reachable.
 *
 * Unauthenticated on purpose: a deploy check that needs a token is a deploy
 * check nobody runs. Everything here is derivable from the repository anyway,
 * and it exposes no configuration and no secrets.
 */
export const dynamic = "force-dynamic";

export function GET() {
	const sha =
		process.env.VERCEL_GIT_COMMIT_SHA ??
		process.env.BUILD_SHA ??
		process.env.COMMIT_SHA;

	return NextResponse.json(
		{
			commit: sha ? sha.slice(0, 12) : "unknown",
			branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
			environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
			deployedAt: process.env.VERCEL_DEPLOYMENT_ID ?? null,
			runtime: process.version,
		},
		{
			// Never cached. A cached answer to "what is running?" is worse than
			// no answer — it is the wrong answer, convincingly.
			headers: { "cache-control": "no-store, max-age=0" },
		},
	);
}
