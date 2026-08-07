"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthUserStore } from "@/store/auth-user.store";
import { useDeactivateAccount } from "@/hooks/api/useDeactivateAccount";
import { deleteCookie } from "@/utils/cookie.util";
import DeleteAccountDialogBase from "./DeleteAccountDialogBase";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DeactivateAccountDialog({ open, onClose }: Props) {
  const router = useRouter();
  const { clearAuthUser } = useAuthUserStore();
  const deactivateAccount = useDeactivateAccount();
  const t = useTranslations("settings.deleteAccount");

  const handleDeactivate = async () => {
    try {
      await deactivateAccount.mutateAsync();
      clearAuthUser();
      await Promise.all([
        deleteCookie("access_token"),
        deleteCookie("refresh_token"),
      ]);
      onClose();
      router.replace("/login");
    } catch {
      // The mutation displays the translated API error.
    }
  };

  return (
    <DeleteAccountDialogBase
      open={open}
      onClose={onClose}
      title={t("deactivateTitle")}
      description={t("deactivateDescription")}
      submitLabel={t("deactivateConfirm")}
      cancelLabel={t("cancel")}
      collectFeedback={false}
      onSubmit={handleDeactivate}
    />
  );
}
