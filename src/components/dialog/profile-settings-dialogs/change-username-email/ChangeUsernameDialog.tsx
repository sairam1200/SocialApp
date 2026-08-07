"use client";

import ChangeFieldDialogBase from "@/components/dialog/profile-settings-dialogs/change-username-email/ChangeFieldDialogBase";
import { apiClient } from "@/services/apiClient.service";
import { SuggestUsernameResponseType } from "@/types/auth/suggest-username.type";

const TAKEN = {
    title: "The username you entered is already taken",
    description: "Please choose another username.",
};

function validateUsername(value: string, initialUsername?: string) {
    const v = value.trim();
    const old = (initialUsername ?? "").trim();

    if (!v) return "New Username is required.";
    if (v === old) return "New username must be different from the current one.";
    if (v.length < 3) return "Username must be at least 3 characters.";
    if (v.length > 30) return "Username must be at most 30 characters.";

    if (!/^[a-zA-Z0-9._]+$/.test(v)) return "Use only Latin letters, numbers, dot or underscore.";
    if (/^[._]/.test(v) || /[._]$/.test(v)) return "Username can't start or end with dot/underscore.";
    if (/[._]{2,}/.test(v)) return "Username can't contain consecutive dots/underscores.";

    return null;
}

export default function ChangeUsernameDialog(props: {
    open: boolean;
    onClose: () => void;
    initialUsername?: string;
    onSuccess?: (newUsername: string) => void;
}) {
    const { open, onClose, initialUsername, onSuccess } = props;

    return (
        <ChangeFieldDialogBase
            open={open}
            onClose={onClose}
            title="Change username"
            description="By changing your username, old links pointing to your profile will become inactive. Please make sure to update links to your Gaddr account once you change your username."
            label={
                <>
                    New Username <span className="text-[#BC0E01]">*</span>
                </>
            }
            placeholder="Enter new username"
            initialValue={initialUsername}
            submitLabel="Change Username"
            submittingLabel="Changing..."
            validate={validateUsername}
            takenCopy={TAKEN}
            checkAvailability={async (v) => {
                const resp: SuggestUsernameResponseType = await apiClient.Account.suggestUsernameAsync(v, "validate");
                return Boolean(resp.status);
            }}
            onSubmit={async (v) => {
                const res = await apiClient.User.updateUsername(v, "settings");
                if (res === null) return false;
                onSuccess?.(v);
                return true;
            }}
        />
    );
}