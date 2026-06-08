"use client";

import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";

export type ConnectionType = "manual" | "custom" | "oauth";

interface DisconnectDialogProps {
	open: boolean;
	onClose: () => void;
	onCancel?: () => void;
	onConfirm: () => void;
	platformName: string;
	connectionType: ConnectionType;
	loading?: boolean;
}

export default function DisconnectDialog({
	open,
	onClose,
	onCancel,
	onConfirm,
	platformName,
	connectionType,
	loading = false,
}: DisconnectDialogProps) {
	let title = "";

	if (connectionType === "manual") {
		title = `Remove ${platformName}?`;
	}
	if (connectionType === "custom") {
		title = `Remove “${platformName}”?`;
	}
	if (connectionType === "oauth") {
		title = `Remove ${platformName}?`;
	}

	let description = "";
	if (connectionType === "manual") {
		description = `Are you sure you want to remove ${platformName} from your links? You can always add it back later.`;
	}

	if (connectionType === "custom") {
		description = `Are you sure you want to remove “${platformName}” from your links? You can always add it back later.`;
	}

	if (connectionType === "oauth") {
		description = `Are you sure you want to disconnect ${platformName}? Your content will stop syncing. You can always connect the account at a later time.`;
	}

	let actionLabel = "";
	if (connectionType === "manual") actionLabel = `Remove ${platformName}`;
	if (connectionType === "custom") actionLabel = "Remove Link";
	if (connectionType === "oauth") actionLabel = `Disconnect ${platformName}`;

	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title={title}
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

					<Button
						type="button"
						label={actionLabel}
						variant="destructive"
						loading={loading}
						disabled={loading}
						onClick={onConfirm}
					/>
				</div>
			}
		>
			<p className="text-base text-[#333333]">{description}</p>
		</DialogContainer>
	);
}
