"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
	BadgeCheck,
	Bookmark,
	EyeOff,
	Heart,
	Lock,
	MapPin,
	MessageCircle,
	MoreHorizontal,
	Radio,
	Repeat2,
	ShoppingBag,
	Sparkles,
	Users,
} from "lucide-react";
import { cn } from "@/utils/cn.util";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Post, ReactionType, Visibility } from "@/types/community.type";
import { PostPoll } from "./PostPoll";
import { PostMediaGrid } from "./PostMediaGrid";
import { DisclosureBadge } from "./DisclosureBadge";
import { WhyThisPost } from "./WhyThisPost";
import SharePopup from "@/components/share/SharePopup";
import { ShareIcon } from "@/components/ui/share-icon";

export interface PostCardProps {
	post: Post;
	/** Which surface this is rendered on, for engagement attribution. */
	surface?: string;
	position?: number;
	onReact?: (postId: string, type: ReactionType) => void;
	onReply?: (post: Post) => void;
	onRepost?: (post: Post) => void;
	onShare?: (post: Post, channel?: "copy_link" | "social") => void;
	onNotInterested?: (postId: string) => void;
	onVote?: (postId: string, optionId: string) => void;
	onImpression?: (postId: string, position?: number) => void;
	/** Compact form for embedded contexts — a repost target, a search hit. */
	compact?: boolean;
	className?: string;
}

/** Icon and label for each visibility level. Public gets neither — it is the norm. */
const VISIBILITY_META: Record<
	Exclude<Visibility, "public">,
	{ icon: typeof Users; key: string }
> = {
	followers: { icon: Users, key: "visibility.followers" },
	close_friends: { icon: Lock, key: "visibility.closeFriends" },
	brand_partners: { icon: Lock, key: "visibility.brandPartners" },
	private: { icon: Lock, key: "visibility.private" },
};

/**
 * One card renders every kind of post.
 *
 * Updates, photos, videos, stories, polls, reposts, quotes, live announcements
 * and clips differ by which optional block is present, not by which component
 * was chosen. That mirrors the single `posts` table on the server, and it is
 * what stops the like button behaving differently on a photo than on a poll.
 */
export function PostCard({
	post,
	surface = "feed",
	position,
	onReact,
	onReply,
	onRepost,
	onShare,
	onNotInterested,
	onVote,
	onImpression,
	compact = false,
	className,
}: PostCardProps) {
	const t = useTranslations("community");
	const format = useFormatter();
	const [menuOpen, setMenuOpen] = useState(false);
	const cardRef = useRef<HTMLElement | null>(null);
	const reported = useRef(false);

	/**
	 * Report an impression when at least half the card has been visible.
	 *
	 * "Rendered" is not "seen": a card mounted below the fold and never scrolled
	 * to would otherwise count, and the ranker would learn from something nobody
	 * looked at.
	 */
	useEffect(() => {
		if (!onImpression || reported.current) return;
		const element = cardRef.current;
		if (!element || typeof IntersectionObserver === "undefined") return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting && !reported.current) {
						reported.current = true;
						onImpression(post.id, position);
						observer.disconnect();
					}
				}
			},
			{ threshold: 0.5 },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [onImpression, post.id, position]);

	const publishedAt = post.publishedOn ?? post.createdOn;
	const publishedDate = new Date(publishedAt);
	const isReacted = Boolean(post.viewerReaction);

	const handleReact = useCallback(() => {
		onReact?.(post.id, "like");
	}, [onReact, post.id]);

	const visibilityMeta =
		post.visibility === "public" ? null : VISIBILITY_META[post.visibility];

	// Tags the body does not already show as an inline link. Rendering a tag
	// twice on one card is noise, and it makes "click the hashtag" ambiguous.
	const bodyTags = new Set(
		(post.body?.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((tag) =>
			tag.slice(1).toLowerCase(),
		),
	);
	const extraTags = post.tags.filter((tag) => !bodyTags.has(tag.toLowerCase()));

	return (
		<article
			ref={cardRef}
			data-testid="community-post"
			data-post-id={post.id}
			className={cn(
				"group relative rounded-2xl border border-border bg-card text-card-foreground transition-shadow",
				"hover:shadow-[0_2px_24px_rgba(54,0,249,0.07)]",
				compact ? "p-3" : "p-4 sm:p-5",
				className,
			)}
		>
			{/* ---------------------------------------------------------- header */}
			<header className="flex items-start gap-3">
				<Link
					href={`/community/${post.author.handle}`}
					className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
					aria-label={post.author.displayName}
				>
					<UserAvatar
						src={post.author.avatarUrl}
						alt={post.author.displayName}
						size={compact ? "sm" : "md"}
					/>
				</Link>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
						<Link
							href={`/community/${post.author.handle}`}
							className="truncate font-semibold hover:underline"
						>
							{post.author.displayName}
						</Link>
						{post.author.isVerified && (
							<BadgeCheck
								className="size-4 shrink-0 text-primary"
								aria-label={t("verified")}
							/>
						)}
						<span className="truncate text-sm text-muted-foreground">
							@{post.author.handle}
						</span>
						<span aria-hidden className="text-muted-foreground">
							·
						</span>
						{/*
						  An absolute date in the title so the exact moment is always
						  reachable, a relative one in the label because that is what a
						  reader actually wants at a glance.
						*/}
						<time
							dateTime={publishedDate.toISOString()}
							title={format.dateTime(publishedDate, {
								dateStyle: "full",
								timeStyle: "short",
							})}
							className="shrink-0 text-sm text-muted-foreground"
						>
							{format.relativeTime(publishedDate)}
						</time>

						{visibilityMeta && (
							<span
								className="ml-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
								title={t(visibilityMeta.key)}
							>
								<visibilityMeta.icon className="size-3" aria-hidden />
								{t(visibilityMeta.key)}
							</span>
						)}

						{post.kind === "live" && (
							<span className="ml-1 inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
								<Radio className="size-3 animate-pulse" aria-hidden />
								{t("live")}
							</span>
						)}
					</div>

					{post.author.headline && !compact && (
						<p className="truncate text-xs text-muted-foreground">
							{post.author.headline}
						</p>
					)}
				</div>

				{!compact && (
					<div className="relative shrink-0">
						<button
							type="button"
							onClick={() => setMenuOpen((open) => !open)}
							aria-haspopup="menu"
							aria-expanded={menuOpen}
							aria-label={t("postMenu")}
							className="rounded-full p-1.5 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						>
							<MoreHorizontal className="size-5" />
						</button>

						{menuOpen && (
							<div
								role="menu"
								className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-border bg-popover py-1 text-popover-foreground shadow-lg"
							>
								<button
									type="button"
									role="menuitem"
									onClick={() => {
										onNotInterested?.(post.id);
										setMenuOpen(false);
									}}
									className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
								>
									<EyeOff className="size-4" aria-hidden />
									{t("notInterested")}
								</button>
								<a
									role="menuitem"
									href={post.url}
									className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
								>
									<ShareIcon className="size-4" />
									{t("openPermalink")}
								</a>
							</div>
						)}
					</div>
				)}
			</header>

			{/* -------------------------------------------------------- disclosure */}
			{(post.isSponsored || post.disclosure !== "none") && (
				<DisclosureBadge
					disclosure={post.disclosure}
					sponsorHandle={post.sponsor?.handle}
					sponsorName={post.sponsor?.displayName}
					className="mt-3"
				/>
			)}

			{/* ------------------------------------------------------------- body */}
			{post.body && (
				<div className={cn("whitespace-pre-wrap break-words", compact ? "mt-2 text-sm" : "mt-3")}>
					<PostBody body={post.body} />
				</div>
			)}

			{post.place && (
				<p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
					<MapPin className="size-3.5" aria-hidden />
					{post.place.name}
				</p>
			)}

			{post.media.length > 0 && (
				<PostMediaGrid media={post.media} products={post.products} className="mt-3" />
			)}

			{post.poll && (
				<PostPoll
					poll={post.poll}
					onVote={(optionId) => onVote?.(post.id, optionId)}
					className="mt-3"
				/>
			)}

			{post.linkPreview && !post.media.length && (
				<a
					href={post.linkPreview.url}
					target="_blank"
					rel="noopener noreferrer nofollow"
					className="mt-3 flex overflow-hidden rounded-xl border border-border transition-colors hover:border-primary/40"
				>
					{post.linkPreview.imageUrl && (
						<span className="relative hidden h-24 w-32 shrink-0 sm:block">
							<Image
								src={post.linkPreview.imageUrl}
								alt=""
								fill
								sizes="128px"
								className="object-cover"
							/>
						</span>
					)}
					<span className="min-w-0 p-3">
						<span className="block truncate text-sm font-medium">
							{post.linkPreview.title ?? post.linkPreview.url}
						</span>
						{post.linkPreview.description && (
							<span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
								{post.linkPreview.description}
							</span>
						)}
						<span className="mt-1 block truncate text-xs text-muted-foreground">
							{post.linkPreview.siteName ?? hostOf(post.linkPreview.url)}
						</span>
					</span>
				</a>
			)}

			{/* A repost renders its target inline, one level deep. */}
			{post.repostOf && (
				<div className="mt-3">
					<PostCard post={post.repostOf} compact className="bg-muted/40" />
				</div>
			)}

			{post.products.length > 0 && post.media.length === 0 && (
				<ul className="mt-3 flex flex-wrap gap-2">
					{post.products.map((product) => (
						<li key={product.productId}>
							<a
								href={product.url ?? "#"}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs hover:border-primary hover:text-primary"
							>
								<ShoppingBag className="size-3.5" aria-hidden />
								{product.title}
								{product.priceMinor && (
									<span className="font-medium">
										{formatMinor(product.priceMinor, product.currency)}
									</span>
								)}
							</a>
						</li>
					))}
				</ul>
			)}

			{extraTags.length > 0 && !compact && (
				<ul className="mt-3 flex flex-wrap gap-1.5">
					{extraTags.slice(0, 6).map((tag) => (
						<li key={tag}>
							<Link
								href={`/community/explore?q=%23${encodeURIComponent(tag)}`}
								className="text-sm text-primary hover:underline"
							>
								#{tag}
							</Link>
						</li>
					))}
				</ul>
			)}

			{/* ----------------------------------------------------------- actions */}
			{!compact && (
				<footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
					<div className="flex items-center gap-1">
						<ActionButton
							icon={Heart}
							count={post.likesCount}
							active={isReacted}
							activeClass="text-rose-500"
							label={t("like")}
							onClick={handleReact}
							testId="post-like"
						/>
						<ActionButton
							icon={MessageCircle}
							count={post.commentsCount}
							label={t("reply")}
							onClick={() => onReply?.(post)}
							testId="post-reply"
						/>
						<ActionButton
							icon={Repeat2}
							count={post.repostsCount}
							label={t("repost")}
							onClick={() => onRepost?.(post)}
							testId="post-repost"
						/>
						<SharePopup
							url={post.url}
							heading="Share Post"
							title={post.author.displayName}
							iconOnly
							count={post.sharesCount}
							testId="post-share"
							preview={{
								avatarSrc: post.author.avatarUrl,
								name: post.author.displayName,
								handle: post.author.handle,
							}}
							onCopy={() => onShare?.(post, "copy_link")}
							onSocialShare={(platform) => onShare?.(post, platform === "copy_link" ? "copy_link" : "social")}
						/>
					</div>

					{post.reasons.length > 0 && <WhyThisPost reasons={post.reasons} />}
				</footer>
			)}
		</article>
	);
}

interface ActionButtonProps {
	icon: typeof Heart;
	count: number;
	label: string;
	active?: boolean;
	activeClass?: string;
	onClick?: () => void;
	testId?: string;
}

function ActionButton({
	icon: Icon,
	count,
	label,
	active,
	activeClass,
	onClick,
	testId,
}: ActionButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			data-testid={testId}
			aria-pressed={active}
			aria-label={`${label}${count > 0 ? ` (${count})` : ""}`}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm transition-colors",
				"text-muted-foreground hover:bg-muted hover:text-foreground",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
				active && activeClass,
			)}
		>
			<Icon className={cn("size-[18px]", active && "fill-current")} aria-hidden />
			{count > 0 && <span className="tabular-nums">{compactCount(count)}</span>}
		</button>
	);
}

/**
 * Render a body with hashtags and mentions as links.
 *
 * Splitting on the pattern rather than injecting HTML — a post body is user
 * input, and `dangerouslySetInnerHTML` on it is an XSS in a social feed, which
 * is the worst place to have one.
 */
export function PostBody({ body }: { body: string }) {
	const parts = body.split(/(#[\p{L}\p{N}_]+|@[a-z0-9_.]+)/giu);
	return (
		<>
			{parts.map((part, index) => {
				if (part.startsWith("#") && part.length > 1) {
					return (
						<Link
							key={`${part}-${index}`}
							href={`/community/explore?q=${encodeURIComponent(part)}`}
							className="text-primary hover:underline"
						>
							{part}
						</Link>
					);
				}
				if (part.startsWith("@") && part.length > 1) {
					return (
						<Link
							key={`${part}-${index}`}
							href={`/community/${part.slice(1)}`}
							className="text-primary hover:underline"
						>
							{part}
						</Link>
					);
				}
				return <span key={`text-${index}`}>{part}</span>;
			})}
		</>
	);
}

/** 1234 → "1.2k". Keeps an action row from reflowing as counts grow. */
export function compactCount(value: number): string {
	if (!Number.isFinite(value) || value < 1000) return String(Math.max(0, value));
	if (value < 1_000_000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
	return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

/** Minor units → a display string. Money never becomes a float on the way. */
export function formatMinor(minor: string, currency: string): string {
	const asNumber = Number(minor);
	if (!Number.isFinite(asNumber)) return "";
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency,
		maximumFractionDigits: 2,
	}).format(asNumber / 100);
}

function hostOf(url: string): string {
	try {
		return new URL(url).host;
	} catch {
		return url;
	}
}

export { Sparkles as PostSparkleIcon, Bookmark as PostBookmarkIcon };
