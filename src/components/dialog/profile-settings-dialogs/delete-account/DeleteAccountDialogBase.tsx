"use client";

import { useState } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn.util";

interface Props {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	submitLabel: string;
	onSubmit: () => void;
	reasons?: string[];
	topContent?: React.ReactNode;
}

const defaultReasons = [
	"I don't use the service enough",
	"I'm switching to a competitor",
	"I don't like the service",
	"The product is confusing or hard to use",
	"Other",
];

export default function DeleteAccountDialogBase({
	open,
	onClose,
	title,
	description,
	submitLabel,
	onSubmit,
	reasons = defaultReasons,
	topContent,
}: Props) {
	const [selectedReason, setSelectedReason] = useState("");
	const [otherReason, setOtherReason] = useState("");

	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title={title}
			maxWidthClass="max-w-2xl"
			footer={
				<div className="flex justify-end gap-4">
					<Button type="button" label="Cancel" variant="secondary" onClick={onClose} />
					<Button type="button" variant="destructive" label={submitLabel} onClick={onSubmit} />
				</div>
			}
		>
			{/*  CUSTOM CONTENT BLOCK ABOVE REASONS  */}
			{topContent && <div className="mb-4">{topContent}</div>}

			{/* Optional description */}
			{description && <p className="mb-4 text-base text-[#333333]">{description}</p>}

			{/*  REASONS  */}
			<div className="space-y-1">
				<p className="mb-4 text-base text-[#333333]">Before you continue, would you like to tell us why?</p>

				{reasons.map((reason) => {
					const isSelected = selectedReason === reason;

					return (
						<label
							key={reason}
							className={cn(
								"flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition",
								isSelected ? "border-[#A855F7] bg-[#FDF7FF]" : "border-[#D6BAFF] hover:bg-[#FAF5FF]"
							)}
						>
							<input
								type="radio"
								name="delete-reason"
								value={reason}
								checked={isSelected}
								onChange={() => setSelectedReason(reason)}
								className="h-4 w-4 accent-[#A855F7]"
							/>
							<span className="text-sm">{reason}</span>
						</label>
					);
				})}

				{/* OTHER custom text field */}
				{selectedReason === "Other" && (
					<textarea
						className="w-full border border-[#D6BAFF] focus:border-[#A855F7] rounded-lg p-3 text-sm"
						rows={3}
						placeholder="Free text here…"
						value={otherReason}
						onChange={(e) => setOtherReason(e.target.value)}
					/>
				)}
			</div>
		</DialogContainer>
	);
}
