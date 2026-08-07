export default function GoodbyeLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-white animate-pulse">
      <header className="bg-white py-2 px-4 flex items-center justify-center">
        <div className="h-10 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-[846px] p-6 flex flex-col items-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full bg-[length:200%_100%]" />
          <div className="h-8 w-96 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
          <div className="h-4 w-80 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}
