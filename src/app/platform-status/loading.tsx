export default function PlatformStatusLoading() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      <div className="w-full h-64 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]" />
      <div className="max-w-6xl mx-auto px-5 py-12 space-y-12">
        <div className="h-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl bg-[length:200%_100%]" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl bg-[length:200%_100%]" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl bg-[length:200%_100%]" />
          ))}
        </div>
      </div>
    </div>
  );
}
