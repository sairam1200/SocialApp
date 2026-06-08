"use client";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";

interface LinkAddedDialogProps {
	open: boolean;
	onClose: () => void;
	platformName: string;
}

export default function LinkAddedDialog({ open, onClose, platformName }: LinkAddedDialogProps) {
	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title="Link added to your profile"
			closeOnOverlayClick={true}
			closeOnEsc={true}
			maxWidthClass="max-w-2xl"
			footer={
				<div className="flex justify-end pb-4">
					<Button type="button" label="Done" onClick={onClose} />
				</div>
			}
		>
			<p className="text-base text-zinc-700">
				Your {platformName} account is linked to your Gaddr me profile. Profile visitors will be able to click on the
				link to visit your {platformName} profile.
			</p>
		</DialogContainer>
	);
}
