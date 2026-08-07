export default function DiscoverSkeleton() {
  return (
    <div className="mt-10 space-y-8 animate-pulse">
      <div className="flex gap-3 border-b border-[#E6E6E6] pb-2">
        {["All", "For you", "Profiles", "Posts", "Reels & Videos", "Projects"].map((tab) => (
          <div key={tab} className="h-8 w-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[440px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl bg-[length:200%_100%]" />
        ))}
      </div>
    </div>
  );
}
