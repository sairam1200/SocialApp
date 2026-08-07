export default function AuthFormSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="space-y-2 text-center">
          <div className="h-8 w-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded mx-auto bg-[length:200%_100%]" />
          <div className="h-4 w-64 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded mx-auto bg-[length:200%_100%]" />
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
          <div className="h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
          <div className="h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        </div>
        <div className="h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
