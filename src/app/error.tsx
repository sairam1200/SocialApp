"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <svg
        className="h-16 w-16 text-red-500 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-600 mb-6">
        {error?.message ?? "An unexpected error occurred while loading this page."}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
        >
          Try again
        </button>

        <button
          onClick={() => {
            // Show stack in console for debugging without leaking to UI

            console.error(error);
            alert("Error logged to console.");
          }}
          className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 focus:outline-none"
        >
          Log details
        </button>
      </div>
    </div>
  );
}