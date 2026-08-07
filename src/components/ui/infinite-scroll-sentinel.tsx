"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

interface InfiniteScrollSentinelProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function InfiniteScrollSentinel({ hasMore, isLoading, onLoadMore }: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!isLoading) requestedRef.current = false;
  }, [isLoading]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !hasMore || isLoading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !requestedRef.current) {
        requestedRef.current = true;
        onLoadMore();
      }
    }, { rootMargin: "320px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div ref={ref} className="col-span-full flex min-h-20 items-center justify-center py-6">
      {hasMore ? (isLoading && <Loader2 className="size-5 animate-spin text-primary" aria-label="Loading more" />) :
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" /> You&apos;re all caught up
        </div>}
    </div>
  );
}
