"use client";

import React from "react";
import { ClassicSerpResult } from "./ClassicSerpResult";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SearchResult } from "@/types/search.types";
import { InfiniteScrollSentinel } from "@/components/ui/infinite-scroll-sentinel";

interface ClassicSerpResultsProps {
  results: SearchResult[];
  query: string;
  totalResults: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onRetry?: () => void;
  renderResult?: (result: SearchResult) => React.ReactNode;
  resultsClassName?: string;
  fullWidth?: boolean;
  onLoadMore?: () => void;
  isFetchingNextPage?: boolean;
  loadingContent?: React.ReactNode;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="py-4 border-b border-border animate-pulse">
          <div className="h-3 bg-muted rounded w-24 mb-2" />
          <div className="h-5 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2 mb-2" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-2/3 mt-1" />
        </div>
      ))}
    </div>
  );
}

export function ClassicSerpResults({
  results,
  query,
  totalResults,
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  isLoading,
  isError,
  error,
  onNextPage,
  onPreviousPage,
  onRetry,
  renderResult,
  resultsClassName,
  fullWidth = false,
  onLoadMore,
  isFetchingNextPage = false,
  loadingContent,
}: ClassicSerpResultsProps) {
  return (
    <div className={fullWidth ? "w-full" : "max-w-[700px] mx-auto"}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-base text-muted-foreground">
          Search Results for &quot;{query}&quot;
          {totalResults > 0 && (
            <span className="ml-2 text-muted-foreground">
              ({totalResults.toLocaleString()} results)
            </span>
          )}
        </h1>
      </div>

      {/* Loading */}
      {isLoading && (loadingContent ?? <LoadingSkeleton />)}

      {/* Error */}
      {!isLoading && isError && (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600 mb-3">
            {error?.message || "Something went wrong. Please try again."}
          </p>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && results.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No results found for &quot;{query}&quot;.
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !isError && results.length > 0 && (
        <div className={resultsClassName}>
          {results.map((result) => (
            <React.Fragment key={`${result.type}:${result.id}`}>
              {renderResult ? renderResult(result) : <ClassicSerpResult result={result} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && onLoadMore && (
        <InfiniteScrollSentinel hasMore={hasNextPage} isLoading={isFetchingNextPage} onLoadMore={onLoadMore} />
      )}
      {!isLoading && !isError && !onLoadMore && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 py-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={onPreviousPage}
            disabled={!hasPreviousPage}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onNextPage}
            disabled={!hasNextPage}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
