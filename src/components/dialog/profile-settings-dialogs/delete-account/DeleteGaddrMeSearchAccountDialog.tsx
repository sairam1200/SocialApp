"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthUserStore } from "@/store/auth-user.store";
import { useDeleteAccount } from "@/hooks/api/useDeleteAccount";
import { deleteCookie } from "@/utils/cookie.util";
import DeleteAccountDialogBase, {
	AccountDeletionFeedback,
} from "./DeleteAccountDialogBase";

interface Props {
	open: boolean;
	onClose: () => void;
}

export default function DeleteGaddrMeSearchAccountDialog({
	open,
	onClose,
}: Props) {
	const router = useRouter();
	const t = useTranslations("settings.deleteAccount");
	const { clearAuthUser } = useAuthUserStore();
	const deleteAccount = useDeleteAccount();

	const handleDelete = async (feedback: AccountDeletionFeedback) => {
		try {
			await deleteAccount.mutateAsync(feedback);
			clearAuthUser();
			await deleteCookie("access_token");
			await deleteCookie("refresh_token");
			onClose();
			router.replace("/goodbye");
		} catch {
			// The mutation hook displays the API error.
		}
	};

	return (
		<DeleteAccountDialogBase
			open={open}
			onClose={onClose}
			title={t("deleteTitle")}
			description={t("deleteDescription")}
			submitLabel={t("deleteAccountPermanentlyButton")}
			cancelLabel={t("cancel")}
			onSubmit={handleDelete}
			collectFeedback
			feedbackQuestion={t("feedbackQuestion")}
			reasons={[
				t("reasonNotEnoughUse"),
				t("reasonCompetitor"),
				t("reasonService"),
				t("reasonConfusing"),
				t("reasonOther"),
			]}
			commentsLabel={t("commentsLabel")}
			commentsPlaceholder={t("commentsPlaceholder")}
			suggestionsLabel={t("suggestionsLabel")}
			suggestionsPlaceholder={t("suggestionsPlaceholder")}
		/>
	);
}
