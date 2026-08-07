"use client";

import React, { memo, useMemo, useCallback } from "react";
import { cn } from "@/utils/cn.util";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProfileFormData } from "./types";
import type { Interest } from "@/types/auth/Onboarding.type";

interface StepTwoInterestsProps {
	formData: ProfileFormData;
	topics: Interest[];
	toggleInterest: (topicId: string) => void;
	onBack: () => void;
	onNext: () => void;
}

interface InterestItemProps {
	interest: Interest;
	checked: boolean;
	onToggle: (topicId: string) => void;
}

const InterestItem = memo(function InterestItem({
	interest,
	checked,
	onToggle,
}: InterestItemProps) {
	const handleChange = useCallback(() => {
		onToggle(interest.id);
	}, [onToggle, interest.id]);

	return (
		<Checkbox
			label={interest.name}
			icon={interest.icon}
			checked={checked}
			onChange={handleChange}
		/>
	);
});

export function StepTwoInterests({
	formData,
	topics,
	toggleInterest,
	onBack,
	onNext,
}: StepTwoInterestsProps) {
	const canProceed = formData.interests.length > 0;

	const selectedTopics = useMemo(() => {
		return new Set(formData.interests);
	}, [formData.interests]);

	const handleToggle = useCallback(
		(topicId: string) => {
			toggleInterest(topicId);
		},
		[toggleInterest]
	);


	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card p-8 rounded-4xl border border-indigo-100 shadow-lg flex flex-col h-[750px] w-full max-w-3xl mx-auto">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Choose your interests
				</h2>

				<p className="text-sm text-muted-foreground">
					Select topics that matter to you.
				</p>

				<p className="text-xs text-muted-foreground mt-2">
					Topics loaded: {topics.length}
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 grow overflow-y-auto pr-2 mb-4 scrollbar-thin">
				{Array.isArray(topics) &&
					topics.map((topic) => (
						<InterestItem
							key={topic.id}
							interest={topic}
							checked={selectedTopics.has(
								topic.id
							)}
							onToggle={handleToggle}
						/>
					))}
			</div>

			<div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
				<button
					type="button"
					onClick={onBack}
					className="flex-1 py-4 border-2 border-primary text-primary rounded-full font-bold text-lg hover:bg-accent"
					aria-label="Go back to previous step"
				>
					Go back
				</button>

				<button
					type="button"
					onClick={onNext}
					disabled={!canProceed}
					aria-label="Continue to next step"
					className={cn(
						"flex-1 py-4 rounded-full font-bold text-lg transition-colors",
						canProceed
							? "bg-primary text-white hover:bg-primary/80"
							: "bg-muted text-muted-foreground cursor-not-allowed"
					)}
				>
					Continue
				</button>
			</div>
		</div>
	);
}