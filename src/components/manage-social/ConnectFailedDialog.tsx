"use client";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";

export default function ConnectFailedDialog({
	open,
	onClose,
	platformName,
}: {
	open: boolean;
	platformName: string;
	onClose: () => void;
}) {
	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title={`Connection failed`}
			closeOnOverlayClick={true}
			closeOnEsc={true}
			maxWidthClass="max-w-2xl"
			footer={
				<div className="flex justify-end">
					<Button type="button" label="Done" variant="secondary" onClick={onClose} />
				</div>
			}
		>
			<p className="text-base text-zinc-700">
				There was an issue when trying to connect {platformName} to your Gaddr account. Please try again in a moment.
			</p>
		</DialogContainer>
	);
}
