export default function CodeSentLoading() {
  return (
    <div className="max-w-[359px] mx-auto py-6 animate-pulse">
      <div className="h-8 w-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded mx-auto bg-[length:200%_100%]" />
      <div className="h-4 w-64 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded mx-auto mt-4 bg-[length:200%_100%]" />
      <div className="flex justify-center gap-4 mt-8">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-[46px] h-[46px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-[10px] bg-[length:200%_100%]" />
        ))}
      </div>
      <div className="h-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-full mt-6 bg-[length:200%_100%]" />
    </div>
  );
}
