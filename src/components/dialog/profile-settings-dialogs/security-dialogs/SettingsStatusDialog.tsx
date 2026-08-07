"use client";

import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";

type Action = {
    label: string;
    onClick: () => void;
    variant?: "secondary" | "destructive" | "primary";
    disabled?: boolean;
    loadingLabel?: string;
    loading?: boolean;
};

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;
    text: React.ReactNode;
    primary?: Action;
    secondary?: Action;
    maxWidthClass?: string;
};

export default function SettingsStatusDialog({
    open,
    onClose,
    title,
    text,
    primary,
    secondary,
    maxWidthClass = "max-w-2xl",
}: Props) {
    return (
        <DialogContainer
            open={open}
            onClose={onClose}
            title={title}
            maxWidthClass={maxWidthClass}
            footer={
                <div className="flex justify-end gap-4">
                    {secondary ? (
                        <Button
                            type="button"
                            variant="secondary"
                            label={secondary.loading ? (secondary.loadingLabel ?? secondary.label) : secondary.label}
                            onClick={secondary.onClick}
                            disabled={secondary.disabled || secondary.loading}
                        />
                    ) : null}

                    {primary ? (
                        <Button
                            type="button"
                            label={primary.loading ? (primary.loadingLabel ?? primary.label) : primary.label}
                            onClick={primary.onClick}
                            disabled={primary.disabled || primary.loading}
                        />
                    ) : (
                        <Button type="button" label="Done" onClick={onClose} />
                    )}
                </div>
            }
        >
            <div className="text-[#333333]">{text}</div>
        </DialogContainer>
    );
}
