"use client";

import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";

interface AuthenticatePlatformDialogProps {
	open: boolean;
	onClose: () => void;
	platformName: string;
	onConfirm: () => void;
}

export default function AuthenticatePlatformDialog({
	open,
	onClose,
	platformName,
	onConfirm,
}: AuthenticatePlatformDialogProps) {
	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title={`Do you want to connect ${platformName}?`}
			closeOnOverlayClick={false}
			closeOnEsc
			maxWidthClass="max-w-2xl"
			footer={
				<div className="flex justify-end gap-4">
					<Button type="button" label="Cancel" variant="secondary" onClick={onClose} />
					<Button type="button" label={`Continue to ${platformName}`} onClick={onConfirm} />
				</div>
			}
		>
			<p className="text-base text-zinc-700">
				You are about to connect {platformName} from your Gaddr profile. By adding a connected account, you will be able
				to import, sync and post content on the platform directly from Gaddr Me.
			</p>
		</DialogContainer>
	);
}
