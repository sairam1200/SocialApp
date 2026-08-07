export default function SettingsSkeleton() {
  return (
    <div className="flex gap-10 animate-pulse">
      <div className="w-3/12 space-y-4">
        <div className="h-6 w-40 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        <div className="h-4 w-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        <div className="space-y-3 mt-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-md bg-[length:200%_100%]" />
          ))}
        </div>
      </div>
      <div className="w-9/12 space-y-6">
        <div className="h-6 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        <div className="h-4 w-64 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg bg-[length:200%_100%]" />
          ))}
        </div>
      </div>
    </div>
  );
}
