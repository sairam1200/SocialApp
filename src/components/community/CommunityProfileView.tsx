"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import {
	Award,
	BadgeCheck,
	Globe,
	Handshake,
	Loader2,
	MapPin,
	MessageCircle,
	Sparkles,
	Users,
} from "lucide-react";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { apiClient } from "@/services/apiClient.service";
import type { Post } from "@/types/community.type";
import {
	useCommunityProfile,
	useEngagementReporter,
	useFlatFeed,
	useProfileFeed,
	useReact,
	useVote,
} from "@/hooks/useCommunity";
import { PostCard, compactCount } from "./PostCard";

export interface CommunityProfileViewProps {
	handle: string;
	isAuthenticated?: boolean;
}

/**
 * A Community profile.
 *
 * The timeline has two modes: the profile's own posts, or its posts mixed with
 * what the profiles it follows are posting. The second is what makes a profile
 * a *place* rather than an archive — you can follow one person and see the
 * corner of the network they curate.
 */
export function CommunityProfileView({
	handle,
	isAuthenticated = false,
}: CommunityProfileViewProps) {
	const t = useTranslations("community");
	const format = useFormatter();
	const [includeFollowing, setIncludeFollowing] = useState(false);

	const { data: profile, isLoading, isError } = useCommunityProfile(handle);
	const feed = useProfileFeed(handle, includeFollowing);
	const posts = useFlatFeed(feed.data?.pages);
	const react = useReact();
	const vote = useVote();
	const report = useEngagementReporter("profile");

	const openConversation = useCallback(async () => {
		if (!profile) return;
		try {
			const conversation = await apiClient.Community.openConversation({
				profileId: profile.id,
			});
			window.location.href = `/community/messages?c=${conversation.id}`;
		} catch {
			toast.error(t("messageFailed"));
		}
	}, [profile, t]);

	if (isLoading) {
		return (
			<div className="mx-auto w-full max-w-[680px] space-y-4" aria-busy="true">
				<div className="h-40 animate-pulse rounded-2xl bg-muted/50" />
				<div className="h-24 animate-pulse rounded-2xl bg-muted/40" />
				<span className="sr-only">{t("loadingProfile")}</span>
			</div>
		);
	}

	if (isError || !profile) {
		return (
			<div className="mx-auto max-w-[680px] rounded-2xl border border-border p-10 text-center">
				<h1 className="text-lg font-semibold">{t("profileNotFound")}</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{t("profileNotFoundHelp")}
				</p>
				<Link
					href="/community/explore"
					className="mt-4 inline-block text-sm text-primary hover:underline"
				>
					{t("explore")}
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-[680px]">
			{/* ---------------------------------------------------------- banner */}
			<div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] sm:h-44">
				{profile.bannerUrl && (
					<Image
						src={profile.bannerUrl}
						alt=""
						fill
						sizes="680px"
						className="object-cover"
						priority
					/>
				)}
			</div>

			<header className="-mt-10 px-4 sm:px-6">
				<div className="flex items-end justify-between gap-4">
					<UserAvatar
						src={profile.avatarUrl}
						alt={profile.displayName}
						size="xl"
						showBorder
						className="ring-4 ring-background"
					/>

					<div className="mb-1 flex items-center gap-2">
						{isAuthenticated && !profile.isViewer && (
							<Button
								variant="secondary"
								size="sm"
								label={t("message")}
								icon={<MessageCircle className="size-4" />}
								onClick={openConversation}
							/>
						)}
						{profile.isViewer ? (
							<Link href="/settings/general">
								<Button variant="secondary" size="sm" label={t("editProfile")} />
							</Link>
						) : (
							<FollowButton profile={profile} disabled={!isAuthenticated} />
						)}
					</div>
				</div>

				<div className="mt-3">
					<h1 className="flex items-center gap-1.5 text-xl font-bold">
						{profile.displayName}
						{profile.isVerified && (
							<BadgeCheck className="size-5 text-primary" aria-label={t("verified")} />
						)}
					</h1>
					<p className="text-sm text-muted-foreground">@{profile.handle}</p>

					{profile.headline && (
						<p className="mt-2 text-[15px]">{profile.headline}</p>
					)}
					{profile.bio && (
						<p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">
							{profile.bio}
						</p>
					)}

					<ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
						{profile.location && (
							<li className="inline-flex items-center gap-1">
								<MapPin className="size-3.5" aria-hidden />
								{profile.location}
							</li>
						)}
						{profile.websiteUrl && (
							<li className="inline-flex items-center gap-1">
								<Globe className="size-3.5" aria-hidden />
								<a
									href={profile.websiteUrl}
									target="_blank"
									rel="noopener noreferrer nofollow"
									className="text-primary hover:underline"
								>
									{profile.websiteUrl.replace(/^https?:\/\//, "")}
								</a>
							</li>
						)}
						<li className="inline-flex items-center gap-1">
							<Users className="size-3.5" aria-hidden />
							{t("joined", {
								date: format.dateTime(new Date(profile.createdOn), {
									month: "long",
									year: "numeric",
								}),
							})}
						</li>
					</ul>

					<ul className="mt-3 flex gap-4 text-sm">
						<li>
							<strong className="tabular-nums">
								{compactCount(profile.followersCount)}
							</strong>{" "}
							<span className="text-muted-foreground">{t("followers")}</span>
						</li>
						<li>
							<strong className="tabular-nums">
								{compactCount(profile.followingCount)}
							</strong>{" "}
							<span className="text-muted-foreground">{t("following")}</span>
						</li>
						<li>
							<strong className="tabular-nums">
								{compactCount(profile.postsCount)}
							</strong>{" "}
							<span className="text-muted-foreground">{t("posts")}</span>
						</li>
					</ul>

					{(profile.openToCollaborations || profile.kind === "brand") && (
						<p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium">
							<Handshake className="size-3.5 text-primary" aria-hidden />
							{profile.kind === "brand"
								? t("brandProfile")
								: t("openToCollaborations")}
						</p>
					)}

					{profile.certifications.length > 0 && (
						<div className="mt-4">
							<h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{t("certifications")}
							</h2>
							<ul className="mt-1.5 flex flex-wrap gap-1.5">
								{profile.certifications.map((certification) => (
									<li key={certification.id}>
										<Link
											href={`/community/learn/verify/${certification.verificationCode}`}
											className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
											title={t("verifyCertification")}
										>
											<Award className="size-3.5 text-primary" aria-hidden />
											{certification.title}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</header>

			{/* --------------------------------------------------------- timeline */}
			<div
				role="tablist"
				aria-label={t("timelineMode")}
				className="mt-6 flex gap-1 border-b border-border px-4 sm:px-6"
			>
				<TimelineTab
					active={!includeFollowing}
					onClick={() => setIncludeFollowing(false)}
					label={t("theirPosts")}
				/>
				<TimelineTab
					active={includeFollowing}
					onClick={() => setIncludeFollowing(true)}
					label={t("andWhoTheyFollow")}
					icon={<Sparkles className="size-3.5" aria-hidden />}
				/>
			</div>

			<ul className="mt-4 space-y-3 px-0 sm:px-2">
				{posts.map((post: Post, index: number) => (
					<li key={post.id}>
						<PostCard
							post={post}
							surface="profile"
							position={index}
							onReact={(postId, type) => react.mutate({ postId, type })}
							onVote={(postId, optionId) => vote.mutate({ postId, optionId })}
							onImpression={(postId, position) =>
								report({
									subjectId: postId,
									subjectKind: "post",
									kind: "impression",
									position,
								})
							}
						/>
					</li>
				))}
			</ul>

			{feed.isLoading && (
				<p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" aria-hidden />
					{t("loadingPosts")}
				</p>
			)}

			{!feed.isLoading && posts.length === 0 && (
				<p className="py-10 text-center text-sm text-muted-foreground">
					{t("noPostsYet")}
				</p>
			)}

			{feed.hasNextPage && (
				<div className="py-6 text-center">
					<Button
						variant="secondary"
						size="sm"
						label={t("loadMore")}
						loading={feed.isFetchingNextPage}
						onClick={() => void feed.fetchNextPage()}
					/>
				</div>
			)}
		</div>
	);
}

function TimelineTab({
	active,
	onClick,
	label,
	icon,
}: {
	active: boolean;
	onClick: () => void;
	label: string;
	icon?: React.ReactNode;
}) {
	return (
		<button
			role="tab"
			type="button"
			aria-selected={active}
			onClick={onClick}
			className={cn(
				"-mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
				active
					? "border-primary text-primary"
					: "border-transparent text-muted-foreground hover:text-foreground",
			)}
		>
			{icon}
			{label}
		</button>
	);
}

/**
 * Follow / unfollow.
 *
 * Optimistic, and reverts on failure. `isFollowedByViewer` is `null` for an
 * anonymous reader — "unknown", not "no" — so the button reads "Follow" and
 * the click sends them to sign in rather than silently doing nothing.
 */
function FollowButton({
	profile,
	disabled,
}: {
	profile: { id: string; isFollowedByViewer?: boolean | null };
	disabled?: boolean;
}) {
	const t = useTranslations("community");
	const [following, setFollowing] = useState(
		profile.isFollowedByViewer === true,
	);
	const [busy, setBusy] = useState(false);

	const toggle = useCallback(async () => {
		if (disabled) {
			window.location.href = "/login";
			return;
		}
		const next = !following;
		setFollowing(next);
		setBusy(true);
		try {
			await (next
				? apiClient.User.followUser(profile.id)
				: apiClient.User.unfollowUser(profile.id));
		} catch {
			setFollowing(!next);
			toast.error(t("followFailed"));
		} finally {
			setBusy(false);
		}
	}, [disabled, following, profile.id, t]);

	return (
		<Button
			size="sm"
			variant={following ? "secondary" : "default"}
			label={following ? t("followingLabel") : t("follow")}
			loading={busy}
			onClick={toggle}
			data-testid="follow-button"
		/>
	);
}
