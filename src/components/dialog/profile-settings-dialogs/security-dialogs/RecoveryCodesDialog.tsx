"use client";

import { useEffect, useMemo, useState } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";

type Props = {
    open: boolean;
    onClose: () => void;
};

function generateFakeCodes(count = 10) {
    // TEMP (NO API): mock codes like XXXXX-XXXXX
    const rand = () => Math.random().toString(36).slice(2, 7).toUpperCase();
    return Array.from({ length: count }, () => `${rand()}-${rand()}`);
}

export default function RecoveryCodesDialog({ open, onClose }: Props) {
    /**
     * TEMP (NO API):
     * Codes are mocked on open. Later should come from API
     * (likely after 2FA enable or dedicated recovery-codes endpoints).
     */
    const [codes, setCodes] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open) return;
        setCodes(generateFakeCodes(10));
        setCopied(false);
    }, [open]);

    const left = useMemo(() => codes.slice(0, Math.ceil(codes.length / 2)), [codes]);
    const right = useMemo(() => codes.slice(Math.ceil(codes.length / 2)), [codes]);

    async function handleCopy() {
        /**
         * TEMP:
         * Just copies what we currently show in UI.
         * Later: same behavior, but codes will come from backend.
         */
        try {
            const text = codes.join("\n");
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    }

    return (
        <DialogContainer
            open={open}
            onClose={onClose}
            title="Recovery codes"
            description="Set up methods to recover your accounts in case you can't log in anymore."
            maxWidthClass="max-w-2xl"
            footer={
                <div className="flex justify-end">
                    <Button type="button" label="Done" onClick={onClose} />
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-zinc-700">
                    These codes can be used if you lose access to your two-factor authentication.
                    <br />
                    Store these codes somewhere safe.
                </p>

                <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-5">
                    <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-zinc-800">
                        <div className="space-y-4 flex flex-col items-center">
                            {left.map((c) => (
                                <div key={c} className="font-medium tracking-wide">
                                    {c}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 flex flex-col items-center">
                            {right.map((c) => (
                                <div key={c} className="font-medium tracking-wide">
                                    {c}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 flex justify-center">
                        <Button type="button" label={copied ? "Copied" : "Copy codes"} onClick={handleCopy} variant="secondary" aria-label="Copy recovery codes" />


                    </div>
                </div>
            </div>
        </DialogContainer>
    );
}
