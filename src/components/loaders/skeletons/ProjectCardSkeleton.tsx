export default function ProjectCardSkeleton() {
  return (
    <div className="h-full rounded-2xl border border-[#ECE8FF] bg-white p-5 flex flex-col animate-pulse">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="h-5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-3/4 bg-[length:200%_100%]" />
          <div className="h-6 w-16 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
        </div>
        <div className="space-y-2 mt-3">
          <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-full bg-[length:200%_100%]" />
          <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-2/3 bg-[length:200%_100%]" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-5 w-14 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
          <div className="h-5 w-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
          <div className="h-5 w-16 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#F0F0F0] pt-4">
        <div className="h-3 w-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        <div className="h-5 w-16 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
