"use client";

import { useEffect, useState } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn.util";

interface Props {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	submitLabel: string;
	onSubmit: (feedback: AccountDeletionFeedback) => void;
	reasons?: string[];
	topContent?: React.ReactNode;
	collectFeedback?: boolean;
	cancelLabel: string;
	feedbackQuestion?: string;
	commentsLabel?: string;
	commentsPlaceholder?: string;
	suggestionsLabel?: string;
	suggestionsPlaceholder?: string;
}

export type AccountDeletionFeedback = {
	reason?: string;
	comments?: string;
	suggestions?: string;
};

export default function DeleteAccountDialogBase({
	open,
	onClose,
	title,
	description,
	submitLabel,
	onSubmit,
	reasons = [],
	topContent,
	collectFeedback = true,
	cancelLabel,
	feedbackQuestion,
	commentsLabel,
	commentsPlaceholder,
	suggestionsLabel,
	suggestionsPlaceholder,
}: Props) {
	const [selectedReason, setSelectedReason] = useState("");
	const [comments, setComments] = useState("");
	const [suggestions, setSuggestions] = useState("");

	useEffect(() => {
		if (!open) {
			setSelectedReason("");
			setComments("");
			setSuggestions("");
		}
	}, [open]);

	const handleSubmit = () => {
		onSubmit({
			reason: selectedReason || undefined,
			comments: comments.trim() || undefined,
			suggestions: suggestions.trim() || undefined,
		});
	};

	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title={title}
			maxWidthClass="max-w-2xl"
			footer={
				<div className="flex justify-end gap-4">
					<Button type="button" label={cancelLabel} variant="secondary" onClick={onClose} />
					<Button type="button" variant="destructive" label={submitLabel} onClick={handleSubmit} />
				</div>
			}
		>
			{topContent && <div className="mb-4">{topContent}</div>}

			{description && <p className="mb-4 text-base text-muted-foreground">{description}</p>}

			{collectFeedback && (
				<div className="space-y-3">
					{feedbackQuestion && <p className="mb-4 text-base text-foreground">{feedbackQuestion}</p>}

					{reasons.map((reason) => {
						const isSelected = selectedReason === reason;

						return (
							<label
								key={reason}
								className={cn(
									"flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition",
									isSelected ? "border-primary bg-accent" : "border-border hover:bg-muted"
								)}
							>
								<input
									type="radio"
									name="delete-reason"
									value={reason}
									checked={isSelected}
									onChange={() => setSelectedReason(reason)}
									className="h-4 w-4 accent-primary"
								/>
								<span className="text-sm">{reason}</span>
							</label>
						);
					})}

					{commentsLabel && (
						<label className="space-y-2 text-sm text-foreground">
							<span>{commentsLabel}</span>
							<textarea
								className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
								rows={3}
								placeholder={commentsPlaceholder}
								value={comments}
								onChange={(event) => setComments(event.target.value)}
							/>
						</label>
					)}

					{suggestionsLabel && (
						<label className="space-y-2 text-sm text-foreground">
							<span>{suggestionsLabel}</span>
							<textarea
								className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
								rows={3}
								placeholder={suggestionsPlaceholder}
								value={suggestions}
								onChange={(event) => setSuggestions(event.target.value)}
							/>
						</label>
					)}
				</div>
			)}
		</DialogContainer>
	);
}
