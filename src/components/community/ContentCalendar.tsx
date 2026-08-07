"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { CalendarDays, FileText, Globe2, Lock, Users } from "lucide-react";
import { cn } from "@/utils/cn.util";
import type { CalendarItem, Visibility } from "@/types/community.type";
import { useCalendar, useDrafts } from "@/hooks/useCommunity";
import { PostCard } from "./PostCard";

const VISIBILITY_ICON: Record<Visibility, typeof Globe2> = {
	public: Globe2,
	followers: Users,
	close_friends: Lock,
	brand_partners: Lock,
	private: Lock,
};

const STATUS_STYLE: Record<string, string> = {
	draft: "border-border text-muted-foreground",
	scheduled: "border-primary/50 text-primary",
	published: "border-transparent bg-muted",
};

/**
 * The content calendar.
 *
 * A view over `posts`, not a second store. A calendar that keeps its own copy
 * of what is scheduled is a calendar that will disagree with what actually
 * publishes — and the disagreement always surfaces at the worst moment.
 */
export function ContentCalendar() {
	const t = useTranslations("community");
	const format = useFormatter();

	// A four-week window centred on today: enough to see what just went out and
	// what is queued, without paging.
	const [range] = useState(() => {
		const now = new Date();
		const from = new Date(now);
		from.setDate(from.getDate() - 14);
		const to = new Date(now);
		to.setDate(to.getDate() + 28);
		return { from: from.toISOString(), to: to.toISOString() };
	});

	const { data, isLoading } = useCalendar(range.from, range.to);

	const byDay = useMemo(() => {
		const groups = new Map<string, CalendarItem[]>();
		for (const item of data?.items ?? []) {
			const key = item.at.slice(0, 10);
			const bucket = groups.get(key);
			if (bucket) bucket.push(item);
			else groups.set(key, [item]);
		}
		return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
	}, [data?.items]);

	return (
		<div className="mx-auto w-full max-w-[760px] py-8">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="flex items-center gap-2 text-2xl font-bold">
					<CalendarDays className="size-6 text-primary" aria-hidden />
					{t("contentCalendar")}
				</h1>
				<Link
					href="/community/studio/drafts"
					className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
				>
					<FileText className="size-4" aria-hidden />
					{t("drafts")}
				</Link>
			</header>

			{isLoading && (
				<ul className="mt-6 space-y-3" aria-busy="true">
					{Array.from({ length: 4 }).map((_, i) => (
						<li key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
					))}
				</ul>
			)}

			{!isLoading && byDay.length === 0 && (
				<p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
					{t("noAnalyticsYet")}
				</p>
			)}

			<ol className="mt-6 space-y-6">
				{byDay.map(([day, items]) => (
					<li key={day}>
						<h2 className="text-sm font-semibold text-muted-foreground">
							{format.dateTime(new Date(day), {
								weekday: "long",
								day: "numeric",
								month: "long",
							})}
						</h2>

						<ul className="mt-2 space-y-2">
							{items.map((item) => {
								const Icon = VISIBILITY_ICON[item.visibility] ?? Globe2;
								return (
									<li
										key={item.id}
										className={cn(
											"flex items-center gap-3 rounded-xl border p-3",
											STATUS_STYLE[item.status] ?? "border-border",
										)}
									>
										<time
											dateTime={item.at}
											className="shrink-0 text-xs tabular-nums text-muted-foreground"
										>
											{format.dateTime(new Date(item.at), {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</time>

										<span className="min-w-0 flex-1 truncate text-sm">
											{item.title}
										</span>

										{item.externalPlatforms.length > 0 && (
											<span className="hidden shrink-0 gap-1 sm:flex">
												{item.externalPlatforms.map((platform) => (
													<span
														key={platform}
														className="rounded-full bg-muted px-2 py-0.5 text-[10px] capitalize text-muted-foreground"
													>
														{platform}
													</span>
												))}
											</span>
										)}

										<Icon
											className="size-3.5 shrink-0 text-muted-foreground"
											aria-label={t(`visibility.${visibilityKey(item.visibility)}`)}
										/>
										<span className="shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">
											{item.status}
										</span>
									</li>
								);
							})}
						</ul>
					</li>
				))}
			</ol>
		</div>
	);
}

/** Drafts, rendered as the posts they will become. */
export function DraftList() {
	const t = useTranslations("community");
	const { data: drafts, isLoading } = useDrafts();

	return (
		<div className="mx-auto w-full max-w-[640px] py-8">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="flex items-center gap-2 text-2xl font-bold">
					<FileText className="size-6 text-primary" aria-hidden />
					{t("drafts")}
				</h1>
				<Link
					href="/community/studio/calendar"
					className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
				>
					<CalendarDays className="size-4" aria-hidden />
					{t("contentCalendar")}
				</Link>
			</header>

			{isLoading && (
				<div className="mt-6 space-y-3" aria-busy="true">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
					))}
				</div>
			)}

			{!isLoading && (drafts?.length ?? 0) === 0 && (
				<p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
					{t("emptyLatest")}
				</p>
			)}

			<ul className="mt-6 space-y-3">
				{(drafts ?? []).map((draft) => (
					<li key={draft.id}>
						{/*
						  Drafts render through the same card as anything else, so what
						  you are editing looks like what will be published.
						*/}
						<PostCard post={draft} surface="drafts" />
					</li>
				))}
			</ul>
		</div>
	);
}

/** `close_friends` → `closeFriends`, matching the i18n key names. */
function visibilityKey(visibility: Visibility): string {
	return visibility.replace(/_([a-z])/g, (_, letter: string) =>
		letter.toUpperCase(),
	);
}
