export default function DataDeletionLoading() {
  return (
    <div className="max-w-[800px] mx-auto my-10 p-6 animate-pulse">
      <div className="h-8 w-64 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
      <div className="space-y-3 mt-6">
        <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-full bg-[length:200%_100%]" />
        <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-3/4 bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
