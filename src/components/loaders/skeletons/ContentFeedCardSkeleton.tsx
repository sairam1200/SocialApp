export default function ContentFeedCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden min-w-[225px] h-[440px] animate-pulse">
      <div className="w-full h-[200px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-24 bg-[length:200%_100%]" />
            <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-16 bg-[length:200%_100%]" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-full bg-[length:200%_100%]" />
          <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-3/4 bg-[length:200%_100%]" />
        </div>
        <div className="flex gap-4 pt-2">
          <div className="h-4 w-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
          <div className="h-4 w-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}
