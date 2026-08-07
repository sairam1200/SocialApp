export default function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col items-center bg-white rounded-xl shadow-lg overflow-hidden min-w-[225px] min-h-[340px] p-6 text-center animate-pulse">
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] mb-3" />
      <div className="space-y-2 w-full mb-6">
        <div className="h-5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-2/3 mx-auto bg-[length:200%_100%]" />
        <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-1/2 mx-auto bg-[length:200%_100%]" />
      </div>
      <div className="flex justify-center gap-3 mb-6">
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]" />
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]" />
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]" />
      </div>
      <div className="flex justify-between w-full mb-5 px-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-5 w-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
            <div className="h-3 w-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
          </div>
        ))}
      </div>
      <div className="flex gap-3 w-full mt-auto">
        <div className="h-9 flex-1 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
        <div className="h-9 flex-1 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
