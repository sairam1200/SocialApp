"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BadgeCheck, Search } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UnifiedResults } from "@/components/search/UnifiedResults";
import { useExplore } from "@/hooks/useCommunity";
import { compactCount } from "./PostCard";

/**
 * Explore: one feed of everything, ordered the way the reader wants.
 *
 * It is the same list whether or not there is a query — typing narrows it
 * rather than switching to a different screen. That is deliberate: a discovery
 * surface that becomes a *different* surface the moment you type is two
 * products sharing a URL, and the reader loses their sort and filters crossing
 * between them.
 *
 * The grid is `UnifiedResults`, the same component search uses, so Gaddr posts,
 * Gaddr Jobs listings, live channels and other platforms are genuinely mixed —
 * with mode (chronological / for you / random), source, kind and theme filters
 * all living in the URL.
 *
 * The one thing above the grid is people. Profiles have no place in a
 * keyword-less result list — "recent profiles" is not a thing anyone wants —
 * but "who is worth following" very much is, and that comes from the
 * recommender rather than from search.
 */
export function ExploreView() {
	const t = useTranslations("community");
	const router = useRouter();
	const searchParams = useSearchParams();
	const initial = searchParams.get("q") ?? "";

	const [input, setInput] = useState(initial);
	const [query, setQuery] = useState(initial);

	// People only when there is nothing to search for; with a query the unified
	// results already include matching profiles, and showing both would be the
	// same person twice.
	const { data: discovery } = useExplore("");
	const people = query ? [] : (discovery?.people ?? []).slice(0, 6);

	// Debounce so typing does not fire a request per keystroke, and keep the
	// URL in step so a search is shareable and survives a refresh.
	useEffect(() => {
		const timer = setTimeout(() => {
			setQuery(input);

			// Read the URL as it is *now*, not as it was when this effect ran.
			// The captured `searchParams` is 350 ms stale, and writing it back
			// silently undid any filter the reader changed in the meantime —
			// including, on mount, one they changed before ever typing.
			const params = new URLSearchParams(window.location.search);
			if ((params.get("q") ?? "") === input) return;

			if (input) params.set("q", input);
			else params.delete("q");
			const next = params.toString();
			router.replace(
				next ? `/community/explore?${next}` : "/community/explore",
				{ scroll: false },
			);
		}, 350);
		return () => clearTimeout(timer);
		// `router` is stable; re-running on it would restart the debounce on
		// every replace and never settle.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [input]);

	return (
		<div className="mx-auto w-full max-w-[1100px] py-6">
			<header className="mb-6">
				<h1 className="text-2xl font-bold">{t("exploreTitle")}</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{t("exploreSubtitle")}
				</p>
			</header>

			<div className="relative mb-6">
				<Search
					className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden
				/>
				<input
					type="search"
					value={input}
					onChange={(event) => setInput(event.target.value)}
					placeholder={t("explorePlaceholder")}
					aria-label={t("explorePlaceholder")}
					data-testid="explore-search"
					className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
				/>
			</div>

			{people.length > 0 && (
				<section className="mb-8">
					<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						{t("peopleToFollow")}
					</h2>
					<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{people.map((profile) => (
							<li key={profile.id}>
								<Link
									href={`/community/${profile.handle}`}
									className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary"
								>
									<UserAvatar
										src={profile.avatarUrl}
										alt={profile.displayName}
										size="md"
									/>
									<span className="min-w-0 flex-1">
										<span className="flex items-center gap-1">
											<span className="truncate text-sm font-medium">
												{profile.displayName}
											</span>
											{profile.isVerified && (
												<BadgeCheck
													className="size-3.5 shrink-0 text-primary"
													aria-hidden
												/>
											)}
										</span>
										<span className="block truncate text-xs text-muted-foreground">
											@{profile.handle} · {compactCount(profile.followersCount)}
										</span>
									</span>
								</Link>
							</li>
						))}
					</ul>
				</section>
			)}

			<UnifiedResults keyword={query} basePath="/community/explore" />
		</div>
	);
}
