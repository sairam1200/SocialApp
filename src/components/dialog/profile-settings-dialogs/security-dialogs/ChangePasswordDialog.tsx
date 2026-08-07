"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LockIcon from "@/components/svg/lock-icon.svg";
import { apiClient } from "@/services/apiClient.service";
import CheckMarkIcon from "@/components/svg/checkmark-circle.svg";
import { cn } from "@/utils/cn.util";
import SettingsStatusDialog from "@/components/dialog/profile-settings-dialogs/security-dialogs/SettingsStatusDialog";
type Props = { open: boolean; onClose: () => void };

type HttpishError = { response?: { status?: number; data?: unknown } };

type StatusState =
    | null
    | { kind: "success" | "error"; title: string; text: string };

function getOrCreateDeviceId() {
    if (typeof window === "undefined") return "web";
    const key = "gaddr_device_id";
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const id = window.crypto?.randomUUID?.() ?? `web-${Date.now()}`;
    window.localStorage.setItem(key, id);
    return id;
}

function extractApiMessage(err: unknown): string | null {
    if (!err || typeof err !== "object") return null;
    const e = err as HttpishError;
    const data = e.response?.data;
    if (!data) return null;

    if (typeof data === "object") {
        const r = data as Record<string, unknown>;
        if (typeof r.message === "string" && r.message.trim()) return r.message;
        if (typeof r.title === "string" && r.title.trim()) return r.title;
    }
    if (typeof data === "string" && data.trim()) return data;
    return null;
}

function passwordRules(pw: string) {
    const v = pw ?? "";
    return {
        length: v.length >= 8,
        letter: /[A-Za-z]/.test(v),
        number: /\d/.test(v),
        special: /[^A-Za-z0-9]/.test(v),
    };
}

function RuleRow({ ok, children }: { ok: boolean; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 text-sm text-[#333333]">
            <CheckMarkIcon
                className={cn("h-[18px] w-[18px] shrink-0", ok ? "text-[#512FB6]" : "text-[#595959]")}
                aria-hidden="true"
            />
            <span className="leading-5">{children}</span>
        </div>
    );
}

export default function ChangePasswordDialog({ open, onClose }: Props) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [status, setStatus] = useState<StatusState>(null);

    const t = useTranslations("security");
    const tCommon = useTranslations("common");

    const rules = useMemo(() => passwordRules(newPassword), [newPassword]);
    const allRulesOk = rules.length && rules.letter && rules.number && rules.special;

    const canSubmit = useMemo(() => {
        if (submitting) return false;
        if (!currentPassword.trim()) return false;
        if (!newPassword) return false;
        if (!allRulesOk) return false;
        if (confirm !== newPassword) return false;
        return true;
    }, [submitting, currentPassword, newPassword, confirm, allRulesOk]);

    useEffect(() => {
        if (!open) return;
        setCurrentPassword("");
        setNewPassword("");
        setConfirm("");
        setSubmitting(false);
        setStatus(null);
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    }, [open]);

    function showError(text: string) {
        setStatus({
            kind: "error",
            title: t("passwordNotChanged"),
            text,
        });
    }

    async function handleSubmit() {
        if (!currentPassword.trim()) return showError(t("enterCurrentPasswordError"));
        if (!allRulesOk) return showError(t("passwordNotMatchingRequirements"));
        if (confirm !== newPassword) return showError(t("passwordsDoNotMatch"));

        try {
            setSubmitting(true);

            await apiClient.Account.changePasswordAsync({
                currentPassword,
                newPassword,
                userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
                ipAddress: "0.0.0.0",
                deviceId: getOrCreateDeviceId(),
            });

            setStatus({
                kind: "success",
                title: t("passwordChanged"),
                text: t("passwordChangedSuccess"),
            });
        } catch (err) {
            const msg =
                extractApiMessage(err) ??
                t("failedToChangePassword");

            showError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    // if there is a status, show SettingsStatusDialog instead of the form
    if (status) {
        const isError = status.kind === "error";

        return (
            <SettingsStatusDialog
                open={open}
                onClose={() => {
                    setStatus(null);
                    onClose();
                }}
                title={status.title}
                text={status.text}
                primary={{
                    label: isError ? tCommon("retry") : tCommon("done"),
                    onClick: () => {
                        if (isError) {
                            setStatus(null);
                            return;
                        }
                        setStatus(null);
                        onClose();
                    },
                }}
                secondary={
                    isError
                        ? {
                            label: tCommon("cancel"),
                            onClick: () => {
                                setStatus(null);
                                onClose();
                            },
                        }
                        : undefined
                }
            />
        );
    }

    return (
        <DialogContainer
            open={open}
            onClose={onClose}
            title={t("changePasswordTitle")}
            description={t("changePasswordDescription")}
            maxWidthClass="max-w-2xl"
            footer={
                <div className="flex justify-end gap-4">
                    <Button type="button" label={tCommon("cancel")} variant="secondary" onClick={onClose} disabled={submitting} />
                    <Button type="button" label={submitting ? tCommon("saving") : tCommon("done")} onClick={handleSubmit} disabled={!canSubmit} />
                </div>
            }
        >
            <div className="space-y-5">
                {/* Current */}
                <div className="space-y-2">
                    <div className="text-sm font-semibold">{t("enterCurrentPassword")}</div>
                    <div className="relative">
                        <div className="absolute left-3 top-[12px] text-gray-700">
                            <LockIcon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder={t("enterCurrentPasswordPlaceholder")}
                            className="pl-10"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            error={false}
                            rightIcon={
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                                    onMouseDown={() => setShowCurrentPassword((p) => !p)}
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            }
                        />
                    </div>
                </div>

                {/* New */}
                <div className="space-y-2">
                    <div className="text-sm font-semibold">{t("enterNewPassword")}</div>
                    <div className="relative">
                        <div className="absolute left-3 top-[12px] text-gray-700">
                            <LockIcon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder={t("enterNewPasswordPlaceholder")}
                            className="pl-10"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            error={false}
                            rightIcon={
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                                    onMouseDown={() => setShowNewPassword((p) => !p)}
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            }
                        />
                    </div>
                </div>

                {/* Confirm */}
                <div className="space-y-2">
                    <div className="text-sm font-semibold">{t("confirmNewPassword")}</div>
                    <div className="relative">
                        <div className="absolute left-3 top-[12px] text-gray-700">
                            <LockIcon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t("confirmPasswordPlaceholder")}
                            className="pl-10"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            error={false}
                            rightIcon={
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                                    onMouseDown={() => setShowConfirmPassword((p) => !p)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            }
                        />
                    </div>
                </div>

                {/* Rules */}
                <div className="rounded-lg bg-[#F0EBFF] p-4">
                    <div className="font-semibold text-sm mb-3">{t("passwordMustInclude")}</div>
                    <div className="space-y-3">
                        <RuleRow ok={rules.length}>{t("atLeast8Chars")}</RuleRow>
                        <RuleRow ok={rules.letter}>{t("atLeastOneLetter")}</RuleRow>
                        <RuleRow ok={rules.number}>{t("atLeastOneNumber")}</RuleRow>
                        <RuleRow ok={rules.special}>{t("atLeastOneSpecial")}</RuleRow>
                    </div>
                </div>
            </div>
        </DialogContainer>
    );
}
