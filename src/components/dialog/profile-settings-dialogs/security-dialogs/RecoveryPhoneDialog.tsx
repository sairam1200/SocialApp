// UI + temporary logic for recovery phone dialog
// NOTE: No API calls yet. Backend contract for recovery phone is not available/confirmed.

"use client";

import { useEffect, useMemo, useState } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// import { apiClient } from "@/services/apiClient.service"; // TODO: wire when backend contract is confirmed

type Props = {
    open: boolean;
    onClose: () => void;
};

type CountryOption = {
    code: string;
    name: string;
    dial: string;
    flag: string;
};

const COUNTRIES: CountryOption[] = [
    { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
    { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
];

const countryOptions = COUNTRIES.map((c) => ({
    value: c.code,
    label: c.name,
    icon: <span className="text-base leading-none">{c.flag}</span>,
}));

function onlyDigits(v: string) {
    return v.replace(/[^\d]/g, "");
}

// Temporary minimal validation (will be replaced with backend/phone lib validation later)
function validatePhone(raw: string) {
    const digits = onlyDigits(raw);
    if (!digits) return "Enter your phone number.";
    if (digits.length < 6) return "Phone number is too short.";
    return null;
}

export default function RecoveryPhoneDialog({ open, onClose }: Props) {
    const [country, setCountry] = useState<CountryOption>(COUNTRIES[0]);
    const [phone, setPhone] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [errorText, setErrorText] = useState<string>("");

    const fullPhoneE164 = useMemo(() => {
        const digits = onlyDigits(phone);
        return digits ? `${country.dial}${digits}` : "";
    }, [country.dial, phone]);

    useEffect(() => {
        if (!open) return;

        setCountry(COUNTRIES[0]);
        setPhone("");
        setSending(false);
        setSent(false);
        setErrorText("");
    }, [open]);

    async function handleSend() {
        const err = validatePhone(phone);
        if (err) {
            setErrorText(err);
            return;
        }

        setErrorText("");
        setSending(true);

        try {

            // Current swagger endpoints:
            //  - PATCH /account/phone-number/update?phoneNumber=
            //  - POST  /account/phone-number/confirm  (body is empty -> looks unfinished)
            //
            // We should NOT wire these until backend confirms they are meant for "recovery phone".

            // Temporary UI behavior (no API): simulate "sent" state.
            await new Promise((r) => setTimeout(r, 500));
            setSent(true);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _temp = fullPhoneE164; // keep the computed value referenced for clarity (optional)
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
            title="Recovery phone"
            description="Set up a backup phone number to never lose access to your Gaddr account"
            maxWidthClass="max-w-2xl"
            footer={
                <div className="flex justify-end">
                    <Button type="button" label="Cancel" variant="secondary" onClick={onClose} />
                </div>
            }
        >
            <div className="space-y-4">
                <div className="text-sm text-[#333333]">
                    Enter your phone number to set up a recovery contact. You&apos;ll receive a one-time-code to verify the number.
                </div>

                <div className="flex w-full gap-2">
                    <div className="w-[180px] shrink-0">
                        <Select
                            value={country.code}
                            onValueChange={(code) => {
                                const next = COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
                                setCountry(next);
                                setErrorText("");
                                setSent(false);
                            }}
                            options={countryOptions}
                            placeholder="Select"
                        />
                    </div>

                    <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#333333]">{country.dial}</div>

                        <Input
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                setErrorText("");
                                setSent(false);
                            }}
                            placeholder="46 012 345 6789"
                            className="pl-14"
                            error={errorText || false}
                            errorVariant="text"
                            inputMode="tel"
                            autoComplete="tel"
                        />
                    </div>
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
