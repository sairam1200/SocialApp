export default function IntegrationCallbackLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="h-4 w-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
