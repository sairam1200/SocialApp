export default function ProfileSkeleton() {
	return (
		<div className="flex flex-wrap items-start gap-3 sm:grid sm:grid-cols-[auto_1fr] sm:gap-x-5 sm:gap-y-0">
			{/* Avatar skeleton */}
			<div className="relative w-18 h-18 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse shrink-0" />

			{/* Name and buttons skeleton */}
			<div className="min-w-0 flex-1 sm:flex-none flex flex-col gap-3">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
					<div className="space-y-3">
						<div className="h-7 w-56 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-md animate-pulse bg-[length:200%_100%]" />
						<div className="h-5 w-36 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-md animate-pulse bg-[length:200%_100%]" />
					</div>
					<div className="flex gap-2 sm:gap-3">
						<div className="h-10 w-28 sm:w-36 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-md animate-pulse bg-[length:200%_100%]" />
						<div className="h-10 w-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-md animate-pulse bg-[length:200%_100%]" />
					</div>
				</div>
			</div>

			{/* Profile details skeleton */}
			<div className="w-full sm:col-start-2 sm:-mt-7 mt-6 space-y-6">
				{/* Stats skeleton */}
				<div className="flex gap-8">
					<div className="flex flex-col gap-2">
						<div className="h-4 w-14 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
						<div className="h-6 w-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
					</div>
					<div className="flex flex-col gap-2">
						<div className="h-4 w-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
						<div className="h-6 w-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
					</div>
					<div className="flex flex-col gap-2">
						<div className="h-4 w-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
						<div className="h-6 w-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
					</div>
				</div>

				{/* Bio skeleton */}
				<div className="space-y-3">
					<div className="h-5 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
					<div className="space-y-2">
						<div className="h-4 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
						<div className="h-4 w-5/6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
						<div className="h-4 w-4/6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
					</div>
				</div>

				{/* Connected accounts skeleton */}
				<div className="border-t border-gray-200 pt-6 space-y-4">
					<div className="h-5 w-44 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
					<div className="flex flex-wrap gap-4">
						<div className="flex items-center gap-2.5">
							<div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse bg-[length:200%_100%]" />
							<div className="h-4 w-28 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
						</div>
						<div className="flex items-center gap-2.5">
							<div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse bg-[length:200%_100%]" />
							<div className="h-4 w-28 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse bg-[length:200%_100%]" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
