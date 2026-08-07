"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscoverPaginationProps {
	page: number;
	totalPages: number;
	totalResults: number;
	resultLabel: string;
	onPrevious: () => void;
	onNext: () => void;
}

export function DiscoverPagination({
	page,
	totalPages,
	totalResults,
	resultLabel,
	onPrevious,
	onNext,
}: DiscoverPaginationProps) {
	const t = useTranslations("common");
	const tDiscover = useTranslations("discover");
	const hasNextPage = page < totalPages;
	const hasPreviousPage = page > 1;

	if (totalResults === 0) return null;

	return (
		<div className="flex items-center justify-center gap-4 mt-8">
			<Button
				onClick={onPrevious}
				disabled={!hasPreviousPage}
				className="flex items-center gap-2"
			>
				<ChevronLeft className="w-4 h-4" />
				{t("previous")}
			</Button>
			<span className="text-sm text-gray-600">
				{t("pageOf", { current: page, total: totalPages })}
			</span>
			<Button
				onClick={onNext}
				disabled={!hasNextPage}
				className="flex items-center gap-2"
			>
				{t("next")}
				<ChevronRight className="w-4 h-4" />
			</Button>
		</div>
	);
}
