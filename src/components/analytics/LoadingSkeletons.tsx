"use client";

import { Card } from "./Card";

export function OverviewCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
            <div className="h-8 w-28 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div className="w-full bg-white rounded-xl border border-[#E6E6E6] p-5">
      <div className="h-4 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%] mb-4" />
      <div className="bg-gray-50 rounded-lg animate-pulse" style={{ height }} />
    </div>
  );
}

export function ContentTableSkeleton() {
  return (
    <Card>
      <div className="space-y-4">
        <div className="h-4 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
              <div className="h-3 w-1/4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
