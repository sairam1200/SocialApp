export default function OnboardingLoading() {
  return (
    <div className="mx-auto rounded-2xl max-w-4xl min-h-screen flex flex-col items-center justify-center animate-pulse">
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="h-6 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded mb-4 bg-[length:200%_100%]" />
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-2 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
          ))}
        </div>
      </div>
      <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
        <div className="h-10 w-3/4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        <div className="h-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg bg-[length:200%_100%]" />
        <div className="h-10 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
