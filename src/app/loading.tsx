"use client";

export default function Loading() {
    return (
        <div className="overflow-x-hidden animate-pulse p-6 space-y-8">
            {/* Header skeleton */}
            <header className="flex items-center justify-between">
                <div className="h-10 w-44 bg-gray-200 rounded" />
                <nav className="flex items-center gap-4">
                    <div className="h-8 w-14 bg-gray-200 rounded" />
                    <div className="h-8 w-14 bg-gray-200 rounded" />
                    <div className="h-8 w-14 bg-gray-200 rounded" />
                </nav>
            </header>

            {/* Hero skeleton */}
            <section className="w-full rounded-lg bg-gray-200 h-64" />

            {/* Sections skeletons (Section2 - Section5) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-36 bg-gray-200 rounded" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                ))}
            </section>

            {/* Reviews skeleton */}
            <section className="space-y-4">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 bg-gray-200 rounded space-y-2">
                            <div className="h-4 w-32 bg-gray-300 rounded" />
                            <div className="h-3 w-48 bg-gray-300 rounded" />
                            <div className="h-3 w-24 bg-gray-300 rounded" />
                            <div className="h-3 bg-gray-300 rounded" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer skeleton */}
            <footer className="mt-8 border-t pt-6">
                <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-64 bg-gray-200 rounded" />
            </footer>
        </div>
    );
}