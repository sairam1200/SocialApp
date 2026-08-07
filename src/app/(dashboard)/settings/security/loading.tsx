export default function SecuritySettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-7 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        <div className="h-4 w-72 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded mt-2 bg-[length:200%_100%]" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg bg-[length:200%_100%]" />
        ))}
      </div>
    </div>
  );
}
