import SidebarSkeleton from "./SidebarSkeleton";
import SearchBarSkeleton from "./SearchBarSkeleton";

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 xl:px-8 pt-6 bg-white">
        <SidebarSkeleton />
        <main className="flex-1 min-w-0">
          <SearchBarSkeleton />
          <div className="mt-10 space-y-6">
            <div className="h-8 w-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl bg-[length:200%_100%]" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
