"use client";

import { useTranslations } from "next-intl";
import { Tab, TabList } from "@headlessui/react";
import { Grid2x2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn.util";
import MenuIcon from "@/components/svg/menu-icon.svg";
import { SearchTypeTab } from "@/types/search.types";

const tabKey = (label: string): SearchTypeTab =>
	label.toLowerCase().replace(/\s+/g, "-") as SearchTypeTab;

interface DiscoverTabsProps {
	showSearchResults: boolean;
	searchType: SearchTypeTab;
	viewType: "list" | "grid";
	onViewTypeChange: (type: "list" | "grid") => void;
	onTabChange: (index: number) => void;
}

export function DiscoverTabs({
	showSearchResults,
	searchType,
	viewType,
	onViewTypeChange,
	onTabChange,
}: DiscoverTabsProps) {
	const t = useTranslations("discover");

	const tabs = [
		t("tabAll"),
		t("tabForYou"),
		t("tabProfiles"),
		t("tabPosts"),
		t("tabReelsVideos"),
		t("tabProjects"),
	];
	const searchTypeTabs = [
		t("searchTabAll"),
		t("searchTabForYou"),
		t("searchTabProfiles"),
		t("searchTabContents"),
		t("searchTabProjects"),
	];

	const activeTabs = showSearchResults ? searchTypeTabs : tabs;
	const searchTabIndex = showSearchResults
		? searchTypeTabs.findIndex((t) => tabKey(t) === searchType)
		: -1;

	return (
		<div className="flex flex-wrap items-center gap-3 md:justify-between">
			<TabList className="flex min-w-0 w-full md:w-auto items-center gap-1 overflow-x-auto rounded-xl border border-border bg-background p-1 shadow-sm">
				{activeTabs.map((tab) => (
					<Tab
						key={tab}
						className={({ selected }) =>
			`whitespace-nowrap rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${selected
								? "border-primary bg-accent text-accent-foreground shadow-sm"
								: "bg-transparent"
							}`
						}
					>
						{tab}
					</Tab>
				))}
			</TabList>
			<span className="flex w-full md:w-auto items-center justify-end gap-1 rounded-xl border border-border bg-background p-1">
				<Button
					onClick={() => onViewTypeChange("grid")}
					size="icon"
					aria-label="Grid view"
					className={cn(
						"cursor-pointer rounded-md border-0 shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
						viewType === "grid"
							? "bg-accent text-accent-foreground hover:bg-accent/90"
							: "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
					)}
				>
					<Grid2x2 className={cn("size-6")} />
				</Button>
				<Button
					onClick={() => onViewTypeChange("list")}
					size="icon"
					aria-label="List view"
					className={cn(
						"cursor-pointer rounded-md border-0 shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
						viewType === "list"
							? "bg-accent text-accent-foreground hover:bg-accent/90"
							: "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
					)}
				>
					<MenuIcon className="size-5" />
				</Button>
			</span>
		</div>
	);
}
