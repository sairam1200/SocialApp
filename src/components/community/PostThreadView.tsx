"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/services/apiClient.service";
import type { ComposeInput } from "@/types/community.type";
import {
	useCompose,
	useMyCommunityProfile,
	useReact,
	useThread,
	useVote,
} from "@/hooks/useCommunity";
import { PostCard } from "./PostCard";
import { Composer } from "./Composer";

export interface PostThreadViewProps {
	postId: string;
	isAuthenticated?: boolean;
}

/**
 * A post and its replies.
 *
 * Also where a shared link lands, so it credits the share: a `?ref=` parameter
 * is reported once on mount, which is what turns "sharing grows the author's
 * profile" into a number both parties can see in their analytics.
 */
export function PostThreadView({
	postId,
	isAuthenticated = false,
}: PostThreadViewProps) {
	const t = useTranslations("community");
	const searchParams = useSearchParams();
	const { data, isLoading, isError } = useThread(postId);
	const { data: profile } = useMyCommunityProfile(isAuthenticated);
	const react = useReact();
	const vote = useVote();
	const compose = useCompose();

	const referral = searchParams.get("ref");
	useEffect(() => {
		if (!referral) return;
		// Fire and forget. Attribution failing is not worth telling the reader
		// about, and retrying would double-count the visit.
		void apiClient.Community.recordShareVisit(referral).catch(() => undefined);
	}, [referral]);

	if (isLoading) {
		return (
			<div className="mx-auto max-w-[640px]" aria-busy="true">
				<div className="h-48 animate-pulse rounded-2xl bg-muted/50" />
				<span className="sr-only">{t("loadingPosts")}</span>
			</div>
		);
	}

	if (isError || !data?.root) {
		return (
			<div className="mx-auto max-w-[640px] rounded-2xl border border-border p-10 text-center">
				<h1 className="text-lg font-semibold">{t("profileNotFound")}</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{t("profileNotFoundHelp")}
				</p>
			</div>
		);
	}

	const submit = async (input: ComposeInput) => {
		const post = await compose.mutateAsync({ ...input, parentId: data.root.id });
		return { id: post.id };
	};

	return (
		<div className="mx-auto w-full max-w-[640px] space-y-3">
			<PostCard
				post={data.root}
				surface="permalink"
				onReact={(id, type) => react.mutate({ postId: id, type })}
				onVote={(id, optionId) => vote.mutate({ postId: id, optionId })}
			/>

			{isAuthenticated && (
				<Composer
					profile={profile}
					submit={submit}
					replyTo={{
						id: data.root.id,
						handle: data.root.author.handle,
						visibility: data.root.visibility,
					}}
				/>
			)}

			{data.replies.length > 0 && (
				<ul className="space-y-3 border-l-2 border-border pl-3 sm:pl-4">
					{data.replies.map((reply) => (
						<li key={reply.id}>
							<PostCard
								post={reply}
								surface="permalink"
								onReact={(id, type) => react.mutate({ postId: id, type })}
							/>
						</li>
					))}
				</ul>
			)}

			{compose.isPending && (
				<p className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" aria-hidden />
				</p>
			)}
		</div>
	);
}
