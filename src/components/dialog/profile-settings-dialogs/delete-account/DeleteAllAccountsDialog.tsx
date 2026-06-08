"use client";

import { useRouter } from "next/navigation";
import { useAuthUserStore } from "@/store/auth-user.store";
import { useDeleteAccount } from "@/hooks/api/useDeleteAccount";
import DeleteAccountDialogBase from "./DeleteAccountDialogBase";

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function DeleteGaddrAccountDialog({ open, onClose }: Props) {
    const router = useRouter();
    const { authUser } = useAuthUserStore();
    const deleteAccount = useDeleteAccount();

    const handleDelete = async () => {
        if (!authUser?.id) return;
        await deleteAccount.mutateAsync(authUser.id);
        onClose();
        router.push("/goodbye");
    };

    return (
        <DeleteAccountDialogBase
            open={open}
            onClose={onClose}
            title="Delete All Gaddr Accounts"
            description="You are about to delete your All Your Gaddr Accounts. This action cannot be undone. Once your accounts are deleted, all data associated with the accounts will be deleted permanently."
            submitLabel="Delete All Accounts"
            onSubmit={handleDelete}
        />
    );
}
