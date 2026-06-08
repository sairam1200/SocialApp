"use client";
import { useState } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { cn } from "@/utils/cn.util";
import LinkIcon from "@/components/svg/link-icon.svg";
import SyncIcon from "@/components/svg/sync-icon.svg";
import { Button } from "@/components/ui/button";

interface StopSyncingDialogProps {
	open: boolean;
	onClose: () => void;
	onCancel?: () => void;
	onContinue: (method: "link" | "import") => void;
	platformName: string;
}

function OptionCard({
	title,
	desc,
	active = false,
	icon = null,
	onClick,
}: {
	title: string;
	desc: string;
	active?: boolean;
	icon?: React.ReactNode;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"w-full text-left rounded-xl p-5 border-2 transition cursor-pointer",
				active
					? "gradient-bg-primary border-2 border-transparent text-white"
					: "border-2 bg-transparent border-[var(--secondary)] text-[#0D0D0D]"
			)}
		>
			<div className="flex items-center justify-between">
				<div className="font-semibold">{title}</div>
				{icon && <span className="mr-2">{icon}</span>}
			</div>
			<p className="mt-2 text-sm">{desc}</p>
		</button>
	);
}

export default function StopSyncingDialog({
	open,
	onClose,
	onCancel,
	onContinue,
	platformName,
}: StopSyncingDialogProps) {
	const [selected, setSelected] = useState<"link" | "import">("import");

	const handleContinue = () => {
		onContinue(selected);
		if (selected === "import") {
			console.log(`🌐 Start sync authorization for ${platformName}`);
		}
	};

	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title="Are you sure you want to stop importing content?"
			description="Choose how you want to display content from this account"
			closeOnOverlayClick={false}
			closeOnEsc
			maxWidthClass="max-w-2xl"
			footer={
				<div className="flex justify-end gap-4">
					<Button
						type="button"
						label="Cancel"
						variant="secondary"
						onClick={() => (onCancel ? onCancel() : onClose())}
					/>
					<Button type="button" label="Continue" onClick={handleContinue} />
				</div>
			}
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-4">
				<OptionCard
					title="Display a link"
					desc="Adds a simple link to your account on your profile."
					icon={<LinkIcon />}
					active={selected === "link"}
					onClick={() => setSelected("link")}
				/>
				<OptionCard
					title="Continue syncing"
					desc="Automatically shows your latest posts in your Gaddr feed."
					icon={<SyncIcon />}
					active={selected === "import"}
					onClick={() => setSelected("import")}
				/>
			</div>
			<p className="text-base text-[#333333]">
				You’re currently authenticated with {platformName}. This lets you post and sync content between Facebook and
				your Gaddr profile. By continuing, Facebook will only appear as a link in your profile and your content won’t be
				synced anymore.
			</p>
		</DialogContainer>
	);
}
