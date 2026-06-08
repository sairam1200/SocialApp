"use client";

import { useEffect, useMemo, useState } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn.util";
import UnblockAccDialog from "@/components/dialog/profile-settings-dialogs/security-dialogs/UnblockAccDialog";

type Props = {
    open: boolean;
    onClose: () => void;
};

type BlockedAccount = {
    id: string;
    username: string;
};

export default function ManageBlockedAccDialog({ open, onClose }: Props) {
    /**
     * TEMP (NO API):
     * These accounts are hardcoded for UI preview only.
     * Replace with API integration later:
     * - GET blocked list
     * - POST/DELETE unblock
     */
    const [blocked, setBlocked] = useState<BlockedAccount[]>([
        { id: "1", username: "blocked_account_one" },
        { id: "2", username: "blocked_account_two" },
    ]);

    const [selected, setSelected] = useState<BlockedAccount | null>(null);
    const [openConfirm, setOpenConfirm] = useState(false);

    useEffect(() => {
        if (!open) return;
        // TEMP: reset selection each time dialog opens
        setSelected(null);
        setOpenConfirm(false);
    }, [open]);

    const hasBlocked = useMemo(() => blocked.length > 0, [blocked]);

    function requestUnblock(acc: BlockedAccount) {
        setSelected(acc);
        setOpenConfirm(true);
    }

    function confirmUnblock() {
        if (!selected) return;

        /**
         * TEMP (NO API):
         * Just remove locally for UI.
         * Later replace with API call:
         * - call API to unblock selected.id/selected.username
         * - refetch list or update state from response
         */
        setBlocked((prev) => prev.filter((x) => x.id !== selected.id));
        setOpenConfirm(false);
        setSelected(null);
    }

    return (
        <>
            <DialogContainer
                open={open}
                onClose={onClose}
                title="Manage blocked accounts"
                description="Manage accounts you blocked on Gaddr Me & Search."
                maxWidthClass="max-w-2xl"
                footer={
                    <div className="flex justify-end gap-4">
                        <Button type="button" label="Cancel" variant="secondary" onClick={onClose} />
                        <Button type="button" label="Done" onClick={onClose} />
                    </div>
                }
            >
                <div className="divide-y divide-[#D9D9D9] rounded-xl  border-[#D9D9D9] overflow-hidden">
                    {!hasBlocked ? (
                        <div className="p-4 text-sm text-zinc-600">You have no blocked accounts.</div>
                    ) : (
                        blocked.map((acc) => (
                            <div key={acc.id} className="flex items-center justify-between gap-4 p-4">
                                <p className="text-sm text-zinc-900">@{acc.username}</p>

                                <button
                                    type="button"
                                    onClick={() => requestUnblock(acc)}
                                    className={cn(
                                        "text-sm font-semibold text-[#381D8C] cursor-pointer",
                                        "hover:text-purple-800 active:text-purple-900",
                                        " px-2 py-1",
                                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                                    )}
                                >
                                    Unblock
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContainer>

            <UnblockAccDialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                username={selected?.username ?? ""}
                onConfirm={confirmUnblock}
            />
        </>
    );
}
