"use client";

import { useTranslations } from "next-intl";
import { platforms } from "@/constants/platforms";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@/components/ui/multi-select";

interface DiscoverFiltersProps {
	filters: Record<string, string | string[]>;
	onFilterChange: (sectionKey: string, optionId: string, type: string) => void;
	selectedPlatforms: string[];
	onPlatformsChange: (platforms: string[]) => void;
	showPlatformFilter: boolean;
}

function FilterSection({
	section,
	filters,
	onFilterChange,
}: {
	section: { title: string; key: string; type: string; options: Array<{ id: string; label: string; disabled?: boolean }> };
	filters: Record<string, string | string[]>;
	onFilterChange: (sectionKey: string, optionId: string, type: string) => void;
}) {
	return (
		<div className="mb-6 pb-6 border-b border-[#E6E6E6] last:border-0 last:mb-0 last:pb-0">
			<h4 className="text-black-default font-medium text-sm mb-3">
				{section.title}
			</h4>
			<div className="space-y-3">
				{section.options.map((option) => (
					<label
						key={option.id}
						className={`flex items-center gap-3 ${option.disabled ? "" : "cursor-pointer"}`}
					>
						<input
							type={section.type}
							checked={
								section.type === "radio"
									? filters[section.key] === option.id
									: (filters[section.key] as string[])?.includes(option.id)
							}
							onChange={() =>
								onFilterChange(section.key, option.id, section.type)
							}
							disabled={option.disabled}
							className={
								section.type === "radio"
									? "gradient-radio peer"
									: "w-4 h-4 rounded accent-primary peer"
							}
						/>
						<span
							className={`text-sm ${option.disabled ? "opacity-40" : "text-gray-neutral peer-checked:text-primary"}`}
						>
							{option.label}
						</span>
					</label>
				))}
			</div>
		</div>
	);
}

export function DiscoverFilters({
	filters,
	onFilterChange,
	selectedPlatforms,
	onPlatformsChange,
	showPlatformFilter,
}: DiscoverFiltersProps) {
	const t = useTranslations("discover");

	const filterSections = [
		{
			title: t("contentType"),
			key: "contentType",
			type: "checkbox",
			options: [
				{ id: "feed_post", label: t("feedPost") },
				{ id: "reels_shorts", label: t("reelsShorts") },
				{ id: "live_stream", label: t("liveStream") },
				{ id: "igtv_long_form", label: t("igtvLongForm") },
			],
		},
		{
			title: t("metrics"),
			key: "metrics",
			type: "checkbox",
			options: [
				{ id: "highest_liked", label: t("highestLiked") },
				{ id: "most_commented", label: t("mostCommented") },
				{ id: "most_views", label: t("mostViews") },
				{ id: "fastest_growing", label: t("fastestGrowing"), disabled: true },
			],
		},
		{
			title: t("datePosted"),
			key: "datePosted",
			type: "radio",
			options: [
				{ id: "past_week", label: t("pastWeek") },
				{ id: "past_month", label: t("pastMonth") },
				{ id: "anytime", label: t("anytime") },
			],
		},
	];

	return (
		<>
			{/* Desktop sidebar */}
			<div className="hidden lg:block w-72 space-y-6">
				<div className="px-5 bg-white rounded-lg border border-[#E6E6E6] p-5">
					<h3 className="text-black-default font-semibold text-base mb-4">
						{t("filters")}
					</h3>
					{filterSections.map((section) => (
						<FilterSection
							key={section.key}
							section={section}
							filters={filters}
							onFilterChange={onFilterChange}
						/>
					))}
				</div>
			</div>

			{/* Mobile filters */}
			<div className="lg:hidden mt-5 px-5">
				{filterSections.map((section) => (
					<div key={section.key} className="mb-8">
						<h3 className="text-black-default font-medium text-base mb-4">
							{section.title}
						</h3>
						<div className="space-y-3">
							{section.options.map((option) => (
								<label
									key={option.id}
									className={`flex items-center gap-3 ${option.disabled ? "" : "cursor-pointer"}`}
								>
									<input
										type={section.type}
										checked={
											section.type === "radio"
												? filters[section.key] === option.id
												: (filters[section.key] as string[])?.includes(
														option.id,
													)
										}
										onChange={() =>
											onFilterChange(section.key, option.id, section.type)
										}
										disabled={option.disabled}
										className={`w-4 h-4 ${section.type === "radio" ? "rounded-full" : "rounded"} ${option.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer accent-primary peer"}`}
									/>
									<span
										className={`text-sm ${option.disabled ? "opacity-40" : "text-gray-neutral peer-checked:text-primary"}`}
									>
										{option.label}
									</span>
								</label>
							))}
						</div>
					</div>
				))}
			</div>

			{/* Platform filter */}
			{showPlatformFilter && (
				<div className="w-45">
					<MultiSelect onValuesChange={onPlatformsChange}>
						<MultiSelectTrigger className="w-full">
							<MultiSelectValue
								badgeClassName="border-none p-0"
								clickToRemove={false}
								placeholder={t("filterByPlatform")}
							/>
						</MultiSelectTrigger>
						<MultiSelectContent>
							<MultiSelectGroup>
								{platforms.map((platform) => (
									<MultiSelectItem
										key={platform.id}
										value={platform.id}
										badgeLabel={
											<span>
												<platform.icon className="size-auto scale-70" />
											</span>
										}
									>
										<span className="flex items-center gap-2">
											{<platform.icon className="size-auto scale-80" />}
											{platform.name}
										</span>
									</MultiSelectItem>
								))}
							</MultiSelectGroup>
						</MultiSelectContent>
					</MultiSelect>
				</div>
			)}
		</>
	);
}
