"use client";

import { ClassicSerpResults } from "@/components/search";
import { DiscoverGridProjects } from "./DiscoverGrid";
import { DiscoverPagination } from "./DiscoverPagination";
import type { DiscoverContentModel } from "@/types/discover.type";
import type { SearchTypeTab } from "@/types/search.types";
import type { SearchResult } from "@/types/search.types";

interface DiscoverSearchResultsProps {
	searchQuery: string;
	searchType: SearchTypeTab;
	debouncedSearchQuery: string;
	viewType: "list" | "grid";
	// Unified search results (all types combined)
	results: SearchResult[];
	// Per-type results
	profileResults: any[];
	contentResults: any[];
	projects: any[];
	// Loading states
	isTabFetching: boolean;
	isTabError: boolean;
	tabError: any;
	// Own content results
	ownResults: DiscoverContentModel[];
	// Pagination
	activePage: number;
	activeTotalPages: number;
	activeTotalResults: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onPreviousPage: () => void;
	onNextPage: () => void;
	onRetry: () => void;
}

export function DiscoverSearchResults({
	searchQuery,
	searchType,
	debouncedSearchQuery,
	viewType,
	results,
	profileResults,
	contentResults,
	projects,
	isTabFetching,
	isTabError,
	tabError,
	ownResults,
	activePage,
	activeTotalPages,
	activeTotalResults,
	hasNextPage,
	hasPreviousPage,
	onPreviousPage,
	onNextPage,
	onRetry,
}: DiscoverSearchResultsProps) {
	// Classic SERP for All and per-type tabs
	if (searchType === "all" || searchType === "profiles" || searchType === "contents") {
		const filteredResults = searchType === "all"
			? results
			: searchType === "profiles"
				? profileResults
				: contentResults;

		return (
			<ClassicSerpResults
				results={filteredResults}
				query={debouncedSearchQuery || searchQuery}
				totalResults={activeTotalResults}
				page={activePage}
				totalPages={activeTotalPages}
				hasNextPage={hasNextPage}
				hasPreviousPage={hasPreviousPage}
				isLoading={isTabFetching}
				isError={isTabError}
				error={tabError}
				onNextPage={onNextPage}
				onPreviousPage={onPreviousPage}
				onRetry={onRetry}
			/>
		);
	}

	// Projects tab uses grid layout
	if (searchType === "projects") {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-900">
						Search Results for &quot;{searchQuery}&quot;
					</h2>
					<span className="text-sm text-gray-600">
						{activeTotalResults} projects
					</span>
				</div>

				<DiscoverGridProjects
					viewType={viewType}
					projects={projects}
					isLoading={isTabFetching}
					isError={isTabError}
					error={tabError}
					onRetry={onRetry}
				/>

				{!isTabFetching && !isTabError && activeTotalResults > 0 && (
					<DiscoverPagination
						page={activePage}
						totalPages={activeTotalPages}
						totalResults={activeTotalResults}
						resultLabel="projects"
						onPrevious={onPreviousPage}
						onNext={onNextPage}
					/>
				)}
			</div>
		);
	}

	return null;
}
