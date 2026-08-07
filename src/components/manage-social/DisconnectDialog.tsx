"use client";

import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

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
	const t = useTranslations("manageSocial");
	const commonT = useTranslations("common");

	const isCustom = connectionType === "custom";
	const isOAuth = connectionType === "oauth";
	const title = isCustom
		? t("removeCustomTitle", { platform: platformName })
		: t("removePlatformTitle", { platform: platformName });
	const description = isCustom
		? t("removeCustomDescription", { platform: platformName })
		: isOAuth
			? t("disconnectPlatformDescription", { platform: platformName })
			: t("removePlatformDescription", { platform: platformName });
	const actionLabel = isCustom
		? t("removeLinkAction")
		: isOAuth
			? t("disconnectPlatformAction", { platform: platformName })
			: t("removePlatformAction", { platform: platformName });

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
						label={commonT("cancel")}
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
			<p className="text-base text-foreground">{description}</p>
			{isOAuth && (
				<p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-foreground">
					{t("oauthDataDeletionWarning")}
				</p>
			)}
		</DialogContainer>
	);
}
