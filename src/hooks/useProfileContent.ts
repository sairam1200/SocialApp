"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/services/apiClient.service";
import type { LinkedAccountType } from "@/types/account/profile.type";

type PlatformContent = {
	platform: string;
	id: string;
	title: string;
	description?: string;
	image?: string;
	publishedAt?: string | Date;
	views?: number;
	likes?: number;
	comments?: number;
	url?: string;
};

type ContentsResponse = {
	contents: { id: string; title: string; description?: string; thumbnailUrl?: string; publishedAt?: string; viewCount?: number; likeCount?: number; commentCount?: number; videoId?: string }[];
	nextCursor: string | null;
	hasMore: boolean;
};

export function useProfileContent(linkedAccounts: LinkedAccountType[]) {
	const [contents, setContents] = useState<PlatformContent[]>([]);
	const [loading, setLoading] = useState(true);

	const platforms = linkedAccounts
		.map((a) => a.platform.toLowerCase())
		.filter((p, i, arr) => arr.indexOf(p) === i);

	const loadData = useCallback(async () => {
		if (platforms.length === 0) {
			setContents([]);
			setLoading(false);
			return;
		}

		setLoading(true);

		try {
			const results = await Promise.allSettled(
				platforms.map((platform) =>
					apiClient.Integration.getContents<ContentsResponse>(platform)
				)
			);

			const allContent: PlatformContent[] = [];

			results.forEach((result, index) => {
				if (result.status !== "fulfilled") return;

				const platform = platforms[index];
				const data = result.value;

				if (!data?.contents) return;

				for (const item of data.contents) {
					allContent.push({
						platform,
						id: item.id,
						title: item.title,
						description: item.description,
						image: item.thumbnailUrl,
						publishedAt: item.publishedAt,
						views: item.viewCount,
						likes: item.likeCount,
						comments: item.commentCount,
						url: item.videoId
							? `https://www.youtube.com/watch?v=${item.videoId}`
							: undefined,
					});
				}
			});

			allContent.sort(
				(a, b) =>
					new Date(b.publishedAt ?? 0).getTime() -
					new Date(a.publishedAt ?? 0).getTime()
			);

			setContents(allContent);
		} catch {
			setContents([]);
		} finally {
			setLoading(false);
		}
	}, [platforms]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	return { contents, loading, refresh: loadData };
}
