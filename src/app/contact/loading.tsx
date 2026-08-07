export default function ContactLoading() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-pulse">
      <div className="h-8 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded mx-auto bg-[length:200%_100%]" />
      <div className="space-y-4 mt-8">
        <div className="h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg bg-[length:200%_100%]" />
        <div className="h-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg bg-[length:200%_100%]" />
        <div className="h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg bg-[length:200%_100%]" />
      </div>
    </div>
  );
}
