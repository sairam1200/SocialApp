// UI + temporary logic for recovery email dialog
// NOTE: No API calls yet. Backend endpoints for "Recovery email" are not available/confirmed.

"use client";

import { useEffect, useState } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EnvelopIcon from "@/components/svg/envelop.svg";

type Props = {
    open: boolean;
    onClose: () => void;
};

function validateEmail(v: string) {
    const s = v.trim();
    if (!s) return "Enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "Enter a valid email address.";
    return null;
}

export default function RecoveryEmailDialog({ open, onClose }: Props) {
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [errorText, setErrorText] = useState<string>("");

    useEffect(() => {
        if (!open) return;

        setEmail("");
        setSending(false);
        setSent(false);
        setErrorText("");
    }, [open]);

    async function handleSend() {
        const err = validateEmail(email);
        if (err) {
            setErrorText(err);
            return;
        }

        setErrorText("");
        setSending(true);

        try {
            //
            // Current /account/email/* endpoints are for primary email verification/change flow


            // Temporary UI behavior (no API): simulate "sent" state.
            await new Promise((r) => setTimeout(r, 600));
            setSent(true);
        } catch {
            setErrorText("Failed to send verification code. Please try again.");
        } finally {
            setSending(false);
        }
    }

    return (
        <DialogContainer
            open={open}
            onClose={onClose}
            title="Recovery email"
            description="Set up a backup email address to never lose access to your Gaddr account"
            maxWidthClass="max-w-2xl"
            footer={
                <div className="flex justify-end">
                    <Button type="button" label="Cancel" variant="secondary" onClick={onClose} />
                </div>
            }
        >
            <div className="space-y-4">
                <div className="text-sm text-[#333333]">
                    Enter a backup email address to set up a recovery contact. You&apos;ll receive a one-time-code to verify the
                    email address.
                </div>

                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">
                        <EnvelopIcon className="h-4 w-4" aria-hidden="true" />
                    </div>

                    <Input
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrorText("");
                            setSent(false);
                        }}
                        placeholder="Enter email..."
                        className="pl-10"
                        error={errorText || false}
                        errorVariant="text"
                        inputMode="email"
                        autoComplete="email"
                    />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <button
                        type="button"
                        className="text-sm font-semibold text-[#512FB6] hover:underline disabled:opacity-60"
                        onClick={handleSend}
                        disabled={sending}
                    >
                        {sending ? "Sending..." : "Send verification code"}
                    </button>

                    {sent ? <div className="text-xs text-[#595959]">Verification code sent</div> : null}
                </div>
            </div>
        </DialogContainer>
    );
}
