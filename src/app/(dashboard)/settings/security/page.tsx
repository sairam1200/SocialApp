"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn.util";
import Arrow from "@/components/svg/arrow-down.svg";
import ManageBlockedAccDialog from "@/components/dialog/profile-settings-dialogs/security-dialogs/ManageBlockedAccDialog";
import RecoveryCodesDialog from "@/components/dialog/profile-settings-dialogs/security-dialogs/RecoveryCodesDialog";
import TwoFactorAuthDialog from "@/components/dialog/profile-settings-dialogs/security-dialogs/TwoFactorAuthDialog";
import ChangePasswordDialog from "@/components/dialog/profile-settings-dialogs/security-dialogs/ChangePasswordDialog";
import RecoveryPhoneDialog from "@/components/dialog/profile-settings-dialogs/security-dialogs/RecoveryPhoneDialog";
import RecoveryEmailDialog from "@/components/dialog/profile-settings-dialogs/security-dialogs/RecoveryEmailDialog";

export default function GeneralSettingsPage() {
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [openManageBlockedAcc, setOpenManageBlockedAcc] = useState(false);
    const [openTwoFactorAuth, setOpenTwoFactorAuth] = useState(false);
    const [openRecoveryCodes, setOpenRecoveryCodes] = useState(false);
    const [openRecoveryNumber, setOpenRecoveryNumber] = useState(false);
    const [openRecoveryEmail, setOpenRecoveryEmail] = useState(false);


    const securitySettingsItems: Array<
        | { label: string; description?: string; href: string; onClick?: never }
        | { label: string; description?: string; href?: never; onClick: () => void }
    > = [
            {
                label: "Change password",
                onClick: () => setOpenChangePassword(true),
            },
            {
                label: "Manage blocked accounts",
                onClick: () => setOpenManageBlockedAcc(true),
            },
            {
                label: "Two-factor authentication",
                onClick: () => setOpenTwoFactorAuth(true),
            },

        ];

    const recoveryMethodsItems: Array<
        | { label: string; description?: string; href: string; onClick?: never }
        | { label: string; description?: string; href?: never; onClick: () => void }
    > = [
            {
                label: "Recovery codes",
                onClick: () => setOpenRecoveryCodes(true),
            },
            {
                label: "Recovery number",
                onClick: () => setOpenRecoveryNumber(true),
            },
            {
                label: "Recovery email",
                onClick: () => setOpenRecoveryEmail(true),
            },

        ];

    return (
        <>
            <div className="space-y-8 ">
                {/* Header */}
                <div>
                    <h2 className="text-xl font-bold mb-2">Security</h2>
                    <p className="text-sm text-gray-neutral">
                        Manage authentication and recovery methods
                    </p>
                </div>

                {/* Security settings */}
                <section className="space-y-4 ">

                    <div className="space-y-3">
                        {securitySettingsItems.map((item) => {
                            const content = (
                                <>
                                    <div className="text-left">
                                        <p className="font-medium">{item.label}</p>
                                        {item.description ? (
                                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <Arrow className="rotate-270 w-4 h-4" />
                                    </div>
                                </>
                            );

                            const baseClassName = cn(
                                "flex w-full items-center justify-between border-b border-[#D9D9D9] p-4 cursor-pointer hover:bg-gray-50 transition"
                            );

                            if ("onClick" in item) {
                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={item.onClick}
                                        className={baseClassName}
                                    >
                                        {content}
                                    </button>
                                );
                            }

                            return (
                                <Link key={item.label} href={item.href} className={baseClassName}>
                                    {content}
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="font-semibold text-[20px] mb-2">Recovery Methods</h3>


                    {/* Recovery Methods */}
                    <div className="space-y-3">
                        {recoveryMethodsItems.map((item) => {
                            const content = (
                                <>
                                    <div className="text-left">
                                        <p className="font-medium">{item.label}</p>
                                        {item.description ? (
                                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <Arrow className="rotate-270 w-4 h-4" />
                                    </div>
                                </>
                            );

                            const baseClassName = cn(
                                "flex w-full items-center justify-between border-b border-[#D9D9D9] p-4 cursor-pointer hover:bg-gray-50 transition"
                            );

                            if ("onClick" in item) {
                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={item.onClick}
                                        className={baseClassName}
                                    >
                                        {content}
                                    </button>
                                );
                            }

                            return (
                                <Link key={item.label} href={item.href} className={baseClassName}>
                                    {content}
                                </Link>
                            );
                        })}
                    </div>


                </section>
            </div>

            {/* --- DIALOGS --- */}

            <ManageBlockedAccDialog
                open={openManageBlockedAcc}
                onClose={() => setOpenManageBlockedAcc(false)}
            />

            <RecoveryCodesDialog
                open={openRecoveryCodes}
                onClose={() => setOpenRecoveryCodes(false)}
            />

            <TwoFactorAuthDialog
                open={openTwoFactorAuth}
                onClose={() => setOpenTwoFactorAuth(false)}
            />

            <ChangePasswordDialog
                open={openChangePassword}
                onClose={() => setOpenChangePassword(false)}
            />

            <RecoveryPhoneDialog
                open={openRecoveryNumber}
                onClose={() => setOpenRecoveryNumber(false)}
            />

            <RecoveryEmailDialog
                open={openRecoveryEmail}
                onClose={() => setOpenRecoveryEmail(false)}
            />
        </>
    );
}
