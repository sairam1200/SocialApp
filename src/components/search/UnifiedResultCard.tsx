"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import {
	BadgeCheck,
	Briefcase,
	ExternalLink,
	FileText,
	Image as ImageIcon,
	Info,
	Play,
	Radio,
	User as UserIcon,
	Video,
} from "lucide-react";
import { cn } from "@/utils/cn.util";
import { isExternalResultUrl, isSafeResultUrl } from "@/lib/result-url";
import { UserAvatar } from "@/components/ui/user-avatar";
import type {
	SearchResultItem,
	SearchResultKind,
} from "@/types/unified-search.type";
import { SourceBadge } from "./SourceBadge";

const KIND_ICON: Record<SearchResultKind, typeof Video> = {
	profile: UserIcon,
	post: FileText,
	video: Video,
	image: ImageIcon,
	article: FileText,
	job: Briefcase,
	project: Briefcase,
	stream: Radio,
	course: FileText,
	product: Briefcase,
};

export interface UnifiedResultCardProps {
	item: SearchResultItem;
	/** Compact rows for a dense list; cards for a grid. */
	layout?: "grid" | "list";
	onOpen?: (item: SearchResultItem) => void;
	className?: string;
}

/**
 * One card for every kind of result.
 *
 * A Community post, a Gaddr profile, a live channel, a Gaddr Jobs project and
 * a YouTube video all render through this. That is only possible because the
 * API normalises them first — and it is what makes the "All" tab coherent
 * rather than five stacked lists pretending to be one.
 *
 * Two rules the design turns on:
 *
 * 1. **Ours plays here.** When `playback` is present the media is mounted in
 *    place, so a Gaddr video is watched on Gaddr rather than bounced away.
 * 2. **Theirs is always reachable.** When `source.externalUrl` exists there is
 *    an explicit, labelled way to the original. Never a bare icon — a reader
 *    leaving our site should know they are leaving, and where to.
 */
export function UnifiedResultCard({
	item,
	layout = "grid",
	onOpen,
	className,
}: UnifiedResultCardProps) {
	const t = useTranslations("search");
	const format = useFormatter();
	// An explicit `now` keeps relative times deterministic between the server
	// render and the client one; without it next-intl falls back to the ambient
	// clock and warns, and the two renders can disagree by a tick.
	const now = useNow();
	const [playing, setPlaying] = useState(false);
	const [mediaFailed, setMediaFailed] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	const Icon = KIND_ICON[item.kind] ?? FileText;
	// Reasons are ranker codes. Show the first one we have words for and drop
	// the rest — "topic_affinity" on screen is worse than no explanation at all,
	// and a code the catalogue has not caught up with should not leak out.
	const reason = item.reasons.find((code) => t.has(`reason.${code}`));
	const isList = layout === "list";
	const canPlayInline = Boolean(item.playback) && !mediaFailed;
	const published = item.publishedOn ? new Date(item.publishedOn) : null;
	const isExternalUrl = isExternalResultUrl(item.url);
	const safeSourceUrl = isSafeResultUrl(item.source.externalUrl)
		? item.source.externalUrl
		: null;

	/**
	 * HLS needs Media Source Extensions everywhere except Safari, which plays
	 * `.m3u8` natively. `hls.js` is imported only once someone actually presses
	 * play — a search page can hold fifty cards, and eagerly loading a media
	 * library for each would cost more than the results.
	 */
	useEffect(() => {
		if (!playing || item.playback?.kind !== "hls") return;
		const video = videoRef.current;
		if (!video) return;

		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = item.playback.url;
			void video.play().catch(() => undefined);
			return;
		}

		let destroy: (() => void) | undefined;
		let cancelled = false;

		void import("hls.js")
			.then(({ default: Hls }) => {
				if (cancelled || !Hls.isSupported()) return;
				const hls = new Hls({ lowLatencyMode: true });
				hls.loadSource(item.playback!.url);
				hls.attachMedia(video);
				destroy = () => hls.destroy();
				void video.play().catch(() => undefined);
			})
			.catch(() => setMediaFailed(true));

		return () => {
			cancelled = true;
			destroy?.();
		};
	}, [playing, item.playback]);

	const handleOpen = useCallback(() => onOpen?.(item), [onOpen, item]);

	const media = (
		<span
			className={cn(
				"relative block shrink-0 overflow-hidden bg-muted",
				isList ? "h-24 w-40 rounded-xl" : "aspect-video w-full",
			)}
		>
			{playing && item.playback ? (
				item.playback.kind === "audio" ? (
					<audio
						src={item.playback.url}
						controls
						autoPlay
						className="absolute inset-x-0 bottom-0 w-full"
						onError={() => setMediaFailed(true)}
					/>
				) : (
					<video
						ref={videoRef}
						src={item.playback.kind === "hls" ? undefined : item.playback.url}
						poster={item.playback.posterUrl ?? item.thumbnailUrl}
						controls
						autoPlay
						playsInline
						className="h-full w-full object-contain bg-black"
						onError={() => setMediaFailed(true)}
						data-testid="inline-player"
					>
						<track kind="captions" />
					</video>
				)
			) : item.thumbnailUrl ? (
				<Image
					src={item.thumbnailUrl}
					alt=""
					fill
					sizes={isList ? "160px" : "(max-width: 640px) 100vw, 320px"}
					className="object-cover"
					onError={() => setMediaFailed(true)}
				/>
			) : (
				<span className="flex h-full w-full items-center justify-center">
					<Icon className="size-8 text-muted-foreground/50" aria-hidden />
				</span>
			)}

			{/* Play affordance only when we can genuinely play it here. Offering
			    one that then bounces to another site is worse than no button. */}
			{!playing && canPlayInline && item.playback?.kind !== "image" && (
				<button
					type="button"
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						setPlaying(true);
					}}
					aria-label={t("playHere")}
					data-testid="play-inline"
					className="absolute inset-0 flex items-center justify-center transition-colors hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				>
					<span className="rounded-full bg-black/60 p-3 backdrop-blur">
						<Play className="size-5 fill-white text-white" aria-hidden />
					</span>
				</button>
			)}

			{item.kind === "stream" && (
				<span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
					<Radio className="size-2.5 animate-pulse" aria-hidden />
					{t("live")}
				</span>
			)}

			{item.playback?.durationSeconds ? (
				<span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] tabular-nums text-white">
					{formatDuration(item.playback.durationSeconds)}
				</span>
			) : null}
		</span>
	);

	return (
		<article
			data-testid="unified-result"
			data-kind={item.kind}
			data-platform={item.source.platform}
			className={cn(
				"group overflow-hidden bg-card text-card-foreground",
				isList
					? "flex gap-4 border-b border-border py-5"
					: "rounded-2xl border border-border transition-shadow hover:shadow-[0_2px_20px_rgba(54,0,249,0.08)]",
				className,
			)}
		>
			{/* Ours routes internally; theirs opens in a new tab. Same element,
			    different destination, and the badge already told the reader which. */}
			<CardLink item={item} onClick={handleOpen} className={isList ? "order-2 shrink-0" : "block"}>
				{media}
			</CardLink>

			<div className={cn("min-w-0", isList ? "order-1 flex-1" : "p-3")}>
				<div className="flex flex-wrap items-center gap-1.5">
					<SourceBadge source={item.source} />
					<span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
						<Icon className="size-3" aria-hidden />
						{t(`kind.${item.kind}`)}
					</span>
					{published && (
						<>
							<span aria-hidden className="text-muted-foreground">
								·
							</span>
							<time
								dateTime={published.toISOString()}
								title={format.dateTime(published, { dateStyle: "full" })}
								className="text-[11px] text-muted-foreground"
							>
								{format.relativeTime(published, now)}
							</time>
						</>
					)}
				</div>

				{isList && (
					<CardLink
						item={item}
						onClick={handleOpen}
						className="mt-1 inline-flex max-w-full items-center gap-1 text-xs text-foreground hover:underline"
					>
						<span className="truncate">{item.url}</span>
						{isExternalUrl && (
							<ExternalLink className="size-3 shrink-0" aria-hidden />
						)}
						{isExternalUrl && (
							<span className="sr-only">{t("externalResult")}</span>
						)}
					</CardLink>
				)}

				<CardLink item={item} onClick={handleOpen} className="mt-1.5 block">
					<h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
						{item.title}
					</h3>
				</CardLink>

				{item.description && (
					<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
						{item.description}
					</p>
				)}

				{item.author && (
					<div className="mt-2 flex items-center gap-1.5">
						{item.author.avatarUrl && (
							<UserAvatar
								src={item.author.avatarUrl}
								alt={item.author.name}
								size="xs"
							/>
						)}
						{item.author.gaddrProfileHandle ? (
							<Link
								href={`/${item.author.gaddrProfileHandle}`}
								className="truncate text-xs text-muted-foreground hover:text-primary hover:underline"
							>
								{item.author.name}
							</Link>
						) : (
							<span className="truncate text-xs text-muted-foreground">
								{item.author.name}
							</span>
						)}
						{item.author.isVerified && (
							<BadgeCheck className="size-3 shrink-0 text-primary" aria-hidden />
						)}
					</div>
				)}

				{item.metrics?.priceMinor && (
					<p className="mt-2 text-sm font-semibold text-primary">
						{formatMoney(item.metrics.priceMinor, item.metrics.currency ?? "EUR")}
					</p>
				)}

				<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
					{typeof item.metrics?.views === "number" && item.metrics.views > 0 && (
						<span>{t("views", { count: item.metrics.views })}</span>
					)}
					{typeof item.metrics?.followers === "number" &&
						item.metrics.followers > 0 && (
							<span>{t("followers", { count: item.metrics.followers })}</span>
						)}

					{/* Explicit, labelled, and only when there is somewhere to go.
					    A reader leaving our site should know they are leaving. */}
					{safeSourceUrl && (
						<a
							href={safeSourceUrl}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(event) => event.stopPropagation()}
							data-testid="open-on-source"
							className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
						>
							{t("openOn", { platform: item.source.label })}
							<ExternalLink className="size-3" aria-hidden />
						</a>
					)}
				</div>

				{reason && (
					<p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
						<Info className="size-3" aria-hidden />
						{t(`reason.${reason}`)}
					</p>
				)}
			</div>
		</article>
	);
}

/**
 * The card's own link.
 *
 * Native results are internal routes and use `next/link` so navigation stays
 * client-side; external ones are plain anchors that open in a new tab. Using
 * `next/link` for an off-site URL would prefetch someone else's page.
 */
function CardLink({
	item,
	onClick,
	className,
	children,
}: {
	item: SearchResultItem;
	onClick?: () => void;
	className?: string;
	children: React.ReactNode;
}) {
	if (!isSafeResultUrl(item.url)) {
		return <div className={className}>{children}</div>;
	}

	if (item.url.startsWith("/")) {
		return (
			<Link href={item.url} onClick={onClick} className={className}>
				{children}
			</Link>
		);
	}
	if (!isExternalResultUrl(item.url)) {
		return (
			<a href={item.url} onClick={onClick} className={className}>
				{children}
			</a>
		);
	}
	return (
		<a
			href={item.url}
			target="_blank"
			rel="noopener noreferrer"
			onClick={onClick}
			className={className}
		>
			{children}
		</a>
	);
}

/** 3725 → "1:02:05". */
export function formatDuration(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "";
	const total = Math.round(seconds);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const rest = total % 60;
	const pad = (value: number) => String(value).padStart(2, "0");
	return hours > 0
		? `${hours}:${pad(minutes)}:${pad(rest)}`
		: `${minutes}:${pad(rest)}`;
}

/** Minor units → a display string. Money never becomes a float on the way. */
export function formatMoney(minor: string, currency: string): string {
	const asNumber = Number(minor);
	if (!Number.isFinite(asNumber)) return "";
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(asNumber / 100);
}
