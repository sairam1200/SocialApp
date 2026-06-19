"use client";

import { useRouter } from "next/navigation";
import { useAuthUserStore } from "@/store/auth-user.store";
import { useDeleteAccount } from "@/hooks/api/useDeleteAccount";
import DeleteAccountDialogBase from "./DeleteAccountDialogBase";
import {deleteCookie} from "@/utils/cookie.util";

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

    try {
        await deleteAccount.mutateAsync(authUser.id);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");

        await deleteCookie("refresh_token");

        onClose();

        router.replace("/");
    } catch (error) {
       
            console.error(error);
        
    }
};

    return (
        <DeleteAccountDialogBase
            open={open}
            onClose={onClose}
            title="Delete Gaddr Me & Search Account"
            description="You are about to delete your Gaddr Me account. This action cannot be undone. Once your account is deleted, all data associated with the account will be deleted permanently."
            submitLabel="Delete Account"
            onSubmit={handleDelete}
        />
    );
}
