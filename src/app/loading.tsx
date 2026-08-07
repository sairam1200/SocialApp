"use client";

export default function Loading() {
	return (
		<div className="overflow-x-hidden animate-pulse">
			{/* Hero / Header skeleton — matches the purple gradient hero */}
			<header className="relative w-full pb-[131px] md:min-h-[626px] md:pb-40 bg-[linear-gradient(117deg,#0D0932_28.21%,#501F98_75.34%)] flex flex-col items-center px-[27px] md:px-[45px] pt-6 md:pt-7 overflow-hidden">
				<div className="max-w-7xl w-full">
					{/* Nav skeleton */}
					<nav className="flex items-center justify-between">
						<div className="h-8 w-24 bg-white/10 rounded" />
						<div className="flex items-center gap-4">
							<div className="h-8 w-16 bg-white/10 rounded" />
							<div className="h-8 w-16 bg-white/10 rounded" />
							<div className="h-8 w-8 bg-white/10 rounded-full" />
						</div>
					</nav>
				</div>

				{/* Header content skeleton */}
				<div className="flex flex-col items-center text-center mt-10 md:mt-16">
					{/* Logo */}
					<div className="h-16 w-44 md:h-[92px] md:w-[255px] bg-white/10 rounded-lg mb-6 md:mb-[18px]" />

					{/* Search bar */}
					<div className="h-12 w-full max-w-xl bg-white/10 rounded-full" />

					{/* Suggestion pills */}
					<div className="flex flex-wrap justify-center gap-x-[13px] gap-y-3.5 md:gap-4 mt-10">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="h-9 md:h-12 rounded-full bg-white/10"
								style={{ width: `${120 + i * 20}px` }}
							/>
						))}
					</div>
				</div>
			</header>

			{/* Content sections skeleton */}
			<div className="p-6 space-y-16 max-w-7xl mx-auto">
				{/* Section 2 */}
				<section className="space-y-6">
					<div className="text-center space-y-3">
						<div className="h-8 w-64 bg-muted rounded mx-auto" />
						<div className="h-4 w-96 bg-muted/60 rounded mx-auto max-w-full" />
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="rounded-xl bg-muted/40 h-64" />
						))}
					</div>
				</section>

				{/* Section 3 */}
				<section className="rounded-2xl bg-muted/40 h-72 w-full" />

				{/* Section 4 */}
				<section className="space-y-4">
					<div className="h-7 w-56 bg-muted rounded" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="p-4 rounded-xl bg-muted/40 space-y-3">
								<div className="h-4 w-32 bg-muted/60 rounded" />
								<div className="h-3 w-48 bg-muted/60 rounded" />
								<div className="h-3 w-24 bg-muted/60 rounded" />
								<div className="h-3 w-full bg-muted/60 rounded" />
							</div>
						))}
					</div>
				</section>

				{/* Footer skeleton */}
				<footer className="border-t pt-6 space-y-3">
					<div className="h-4 w-40 bg-muted rounded" />
					<div className="h-3 w-64 bg-muted/60 rounded" />
				</footer>
			</div>
		</div>
	);
}
