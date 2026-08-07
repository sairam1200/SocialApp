"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn.util";
import ContentFeedCard from "@/components/card/ContentFeedCard";
import ProfileCard from "@/components/card/PorfileCard";
import ProjectCard from "@/components/card/ProjectCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { DiscoverContentModel } from "@/types/discover.type";
import { renderPlatformIcon, isValidUrl, normalizeDiscoverContent, mapProfileToProps } from "@/lib/card-helpers";

interface DiscoverGridProps {
	viewType: "list" | "grid";
	items: DiscoverContentModel[];
	renderItem?: (item: DiscoverContentModel) => React.ReactNode;
	hasNextPage?: boolean;
	isFetchingNextPage?: boolean;
	onLoadMore?: () => void;
}

export function DiscoverGrid({
	viewType,
	items,
	renderItem,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
}: DiscoverGridProps) {
	const t = useTranslations("community");
	const defaultRenderItem = (item: DiscoverContentModel) => {
		const cardProps = normalizeDiscoverContent(item, 34);
		const validUrl =
			cardProps.sourceUrl && isValidUrl(cardProps.sourceUrl)
				? cardProps.sourceUrl
				: null;
		return (
			<div
				key={`${item.platform}-${item.id}`}
				onClick={() => {
					if (validUrl) {
						window.open(validUrl, "_blank", "noopener,noreferrer");
					}
				}}
				className={validUrl ? "cursor-pointer" : ""}
			>
				<ContentFeedCard
					{...cardProps}
					platformIcon={renderPlatformIcon(cardProps.platform)}
				/>
			</div>
		);
	};

	const render = renderItem ?? defaultRenderItem;

	return (
		<div className="space-y-6">
			<div
				className="grid gap-6"
				style={{
					gridTemplateColumns:
						viewType === "grid"
							? "repeat(auto-fit, minmax(240px, 1fr))"
							: "1fr",
					maxWidth: "100%",
				}}
			>
				{items.map((item) => render(item))}
			</div>
			{hasNextPage && (
				<div className="col-span-full flex justify-center">
					<Button
						onClick={onLoadMore}
						disabled={isFetchingNextPage}
						className="flex items-center gap-2"
					>
						{isFetchingNextPage ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : null}
						{t("loadMore")}
					</Button>
				</div>
			)}
		</div>
	);
}

interface DiscoverGridProjectsProps {
	viewType: "list" | "grid";
	projects: Array<{ id: string | number; [key: string]: unknown }>;
	isLoading: boolean;
	isError: boolean;
	error?: unknown;
	onRetry?: () => void;
	hasNextPage?: boolean;
	isFetchingNextPage?: boolean;
	onLoadMore?: () => void;
}

export function DiscoverGridProjects({
	viewType,
	projects,
	isLoading,
	isError,
	error,
	onRetry,
}: DiscoverGridProjectsProps) {
	const t = useTranslations("discover");
	const tCommon = useTranslations("common");

	if (isLoading) {
		return (
			<div
				className={cn(
					"grid gap-6",
					viewType === "grid"
						? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
						: "grid-cols-1",
				)}
			>
				{[...Array(12)].map((_, i) => (
					<div
						key={i}
						className="bg-white rounded-lg border border-[#E6E6E6] p-4 animate-pulse h-64"
					>
						<div className="flex gap-4 h-full">
							<div className="w-16 h-16 bg-[#F0F0F0] rounded-lg shrink-0" />
							<div className="flex-1 space-y-2">
								<div className="h-4 bg-[#F0F0F0] rounded w-3/4" />
								<div className="h-3 bg-[#F0F0F0] rounded w-1/2" />
								<div className="h-3 bg-[#F0F0F0] rounded w-2/3" />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
				<p className="text-sm text-gray-600">
					{(error as Error)?.message ?? t("unableToLoadProjects")}
				</p>
				{onRetry && (
					<Button variant="secondary" onClick={onRetry}>
						{tCommon("retry")}
					</Button>
				)}
			</div>
		);
	}

	if (projects.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					{t("noProjectsFound")}
				</h3>
				<p className="text-gray-600 text-center">
					{t("tryDifferentKeywords")}
				</p>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"grid gap-6",
				viewType === "grid"
					? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
					: "grid-cols-1",
			)}
		>
			{projects.map((project) => (
				<ProjectCard key={project.id} project={project as any} />
			))}
		</div>
	);
}

interface DiscoverGridProfilesProps {
	viewType: "list" | "grid";
	profiles: Array<{ id: string | number; [key: string]: unknown }>;
	isLoading: boolean;
	isError: boolean;
	error?: unknown;
	onRetry?: () => void;
}

export function DiscoverGridProfiles({
	viewType,
	profiles,
	isLoading,
	isError,
	error,
	onRetry,
}: DiscoverGridProfilesProps) {
	const t = useTranslations("discover");
	const tCommon = useTranslations("common");

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
				<p className="text-sm text-gray-600">
					{(error as Error)?.message ?? t("unableToLoadCreators")}
				</p>
				{onRetry && (
					<Button variant="secondary" onClick={onRetry}>
						{tCommon("retry")}
					</Button>
				)}
			</div>
		);
	}

	if (profiles.length === 0) {
		return (
			<div className="rounded-xl border border-[#E6E6E6] bg-[#FAFAFA] px-4 py-10 text-center">
				<p className="text-sm text-[#595959]">{t("noCreatorProfiles")}</p>
			</div>
		);
	}

	return (
		<div
			className="grid gap-6"
			style={{
				gridTemplateColumns:
					viewType === "grid"
						? "repeat(auto-fit, minmax(240px, 1fr))"
						: "1fr",
				maxWidth: "100%",
			}}
		>
			{profiles.map((creator) => {
				const cardProps = mapProfileToProps(creator as any);
				return <ProfileCard key={creator.id} {...cardProps} />;
			})}
		</div>
	);
}
