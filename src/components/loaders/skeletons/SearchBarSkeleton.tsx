export default function SearchBarSkeleton() {
  return (
    <div className="mb-5 sm:mb-8 animate-pulse">
      <div className="flex items-center gap-2 px-4 py-3 border border-[#E6E6E6] rounded-lg bg-white">
        <div className="w-5 h-5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        <div className="flex-1 h-5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        <div className="w-5 h-5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
