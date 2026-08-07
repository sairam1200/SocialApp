"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	CalendarDays,
	FileText,
	Info,
	Radio,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import {
	useBalance,
	useCreatorAnalytics,
	useDrafts,
} from "@/hooks/useCommunity";
import { compactCount, formatMinor } from "./PostCard";

const RANGES = [
	{ days: 7, key: "last7" },
	{ days: 28, key: "last28" },
	{ days: 90, key: "last90" },
] as const;

/**
 * Creator studio.
 *
 * Reach is labelled as *distinct people*, not impressions, and says so on the
 * card. Conflating the two is the most common way a creator dashboard flatters
 * its numbers, and a creator who prices a brand deal off an inflated reach
 * figure finds out the expensive way.
 */
export function CreatorStudio() {
	const t = useTranslations("community");
	const format = useFormatter();
	const [days, setDays] = useState<number>(28);

	const { data: analytics, isLoading } = useCreatorAnalytics(days);
	const { data: balance } = useBalance();
	const { data: drafts } = useDrafts();

	return (
		<div className="mx-auto w-full max-w-[900px] py-6">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">{t("studioTitle")}</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{t("studioSubtitle")}
					</p>
				</div>

				<div
					role="tablist"
					aria-label={t("studioTitle")}
					className="flex gap-1 rounded-full border border-border p-1"
				>
					{RANGES.map((range) => (
						<button
							key={range.days}
							role="tab"
							type="button"
							aria-selected={days === range.days}
							onClick={() => setDays(range.days)}
							className={cn(
								"rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
								days === range.days
									? "bg-primary text-white"
									: "text-muted-foreground hover:bg-muted",
							)}
						>
							{t(range.key)}
						</button>
					))}
				</div>
			</header>

			<nav className="mt-6 flex flex-wrap gap-2">
				<QuickLink href="/community/studio/calendar" icon={CalendarDays} label={t("contentCalendar")} />
				<QuickLink
					href="/community/studio/drafts"
					icon={FileText}
					label={`${t("drafts")}${drafts?.length ? ` (${drafts.length})` : ""}`}
				/>
				<QuickLink href="/community/live/setup" icon={Radio} label={t("goLive")} />
			</nav>

			{/* ------------------------------------------------------------ tiles */}
			<ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<Tile
					label={t("impressions")}
					value={compactCount(analytics?.impressions ?? 0)}
					loading={isLoading}
				/>
				<Tile
					label={t("reach")}
					value={compactCount(analytics?.reach ?? 0)}
					hint={t("reachHint")}
					loading={isLoading}
				/>
				<Tile
					label={t("interactions")}
					value={compactCount(analytics?.interactions ?? 0)}
					loading={isLoading}
				/>
				<Tile
					label={t("engagementRate")}
					value={`${((analytics?.engagementRate ?? 0) * 100).toFixed(1)}%`}
					loading={isLoading}
				/>
			</ul>

			{/* ------------------------------------------------------------ chart */}
			<section className="mt-6 rounded-2xl border border-border p-4">
				<h2 className="text-sm font-semibold">{t("impressions")}</h2>
				<div className="mt-3 h-56">
					{analytics?.daily?.length ? (
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={analytics.daily}>
								<defs>
									<linearGradient id="impressionsFill" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
										<stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
								<XAxis
									dataKey="date"
									tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
									tickLine={false}
									axisLine={false}
									tickFormatter={(value: string) => value.slice(5)}
								/>
								<YAxis
									tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
									tickLine={false}
									axisLine={false}
									width={36}
								/>
								<Tooltip
									contentStyle={{
										background: "var(--popover)",
										border: "1px solid var(--border)",
										borderRadius: 12,
										fontSize: 12,
									}}
								/>
								<Area
									type="monotone"
									dataKey="impressions"
									stroke="var(--primary)"
									strokeWidth={2}
									fill="url(#impressionsFill)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					) : (
						<p className="flex h-full items-center justify-center text-sm text-muted-foreground">
							{t("noAnalyticsYet")}
						</p>
					)}
				</div>
			</section>

			{/* --------------------------------------------------------- earnings */}
			<section className="mt-6 rounded-2xl border border-border p-4">
				<h2 className="flex items-center gap-2 text-sm font-semibold">
					<Wallet className="size-4 text-primary" aria-hidden />
					{t("earnings")}
				</h2>

				<ul className="mt-3 grid gap-3 sm:grid-cols-3">
					<MoneyTile
						label={t("available")}
						minor={balance?.availableMinor ?? "0"}
						currency={balance?.currency ?? "EUR"}
						emphasis
					/>
					<MoneyTile
						label={t("pending")}
						minor={balance?.pendingMinor ?? "0"}
						currency={balance?.currency ?? "EUR"}
					/>
					<MoneyTile
						label={t("lifetime")}
						minor={balance?.lifetimeEarnedMinor ?? "0"}
						currency={balance?.currency ?? "EUR"}
					/>
				</ul>

				<Button
					className="mt-4"
					variant="secondary"
					size="sm"
					label={t("requestPayout")}
					disabled={BigInt(balance?.availableMinor ?? "0") <= 0n}
				/>
			</section>

			{/* -------------------------------------------------------- top posts */}
			{analytics?.topPosts && analytics.topPosts.length > 0 && (
				<section className="mt-6 rounded-2xl border border-border p-4">
					<h2 className="flex items-center gap-2 text-sm font-semibold">
						<TrendingUp className="size-4 text-primary" aria-hidden />
						{t("topPosts")}
					</h2>

					<ul className="mt-3 divide-y divide-border">
						{analytics.topPosts.map((post) => (
							<li key={post.id} className="flex items-center gap-4 py-3">
								<span className="min-w-0 flex-1">
									<span className="block truncate text-sm">
										{post.body || "—"}
									</span>
									{post.publishedOn && (
										<span className="block text-xs text-muted-foreground">
											{format.dateTime(new Date(post.publishedOn), {
												dateStyle: "medium",
											})}
										</span>
									)}
								</span>
								<span className="shrink-0 text-right text-xs text-muted-foreground">
									<span className="block tabular-nums">
										{compactCount(post.impressions)} · {compactCount(post.interactions)}
									</span>
									<span className="block tabular-nums text-primary">
										{(post.engagementRate * 100).toFixed(1)}%
									</span>
								</span>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}

function QuickLink({
	href,
	icon: Icon,
	label,
}: {
	href: string;
	icon: typeof Radio;
	label: string;
}) {
	return (
		<Link
			href={href}
			className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
		>
			<Icon className="size-4" aria-hidden />
			{label}
		</Link>
	);
}

function Tile({
	label,
	value,
	hint,
	loading,
}: {
	label: string;
	value: string;
	hint?: string;
	loading?: boolean;
}) {
	return (
		<li className="rounded-2xl border border-border p-4">
			<p className="flex items-center gap-1 text-xs text-muted-foreground">
				{label}
				{hint && <Info className="size-3" aria-label={hint} />}
			</p>
			{loading ? (
				<span className="mt-1.5 block h-7 w-16 animate-pulse rounded bg-muted" />
			) : (
				<p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
			)}
			{hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
		</li>
	);
}

function MoneyTile({
	label,
	minor,
	currency,
	emphasis,
}: {
	label: string;
	minor: string;
	currency: string;
	emphasis?: boolean;
}) {
	return (
		<li
			className={cn(
				"rounded-xl p-3",
				emphasis ? "bg-primary/10" : "bg-muted/50",
			)}
		>
			<p className="text-xs text-muted-foreground">{label}</p>
			<p
				className={cn(
					"mt-0.5 text-lg font-bold tabular-nums",
					emphasis && "text-primary",
				)}
			>
				{formatMinor(minor, currency)}
			</p>
		</li>
	);
}
