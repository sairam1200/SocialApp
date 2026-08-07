export default function TermsLoading() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-pulse">
      <div className="h-8 w-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded mx-auto bg-[length:200%_100%]" />
      <div className="space-y-4 mt-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-full bg-[length:200%_100%]" />
            <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-5/6 bg-[length:200%_100%]" />
            <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-4/6 bg-[length:200%_100%]" />
          </div>
        ))}
      </div>
    </div>
  );
}
