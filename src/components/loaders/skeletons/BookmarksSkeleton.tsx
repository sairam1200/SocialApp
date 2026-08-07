export default function BookmarksSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-6 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded mb-4 bg-[length:200%_100%]" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#E6E6E6]">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-3/4 bg-[length:200%_100%]" />
              <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-1/2 bg-[length:200%_100%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
