"use client";
import { useState } from "react";
import { Platform } from "@/constants/platforms";

export function useSocialDialogs() {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [openStopSyncDialog, setOpenStopSyncDialog] = useState<string | null>(null);
    const [openLinkAccountDialog, setOpenLinkAccountDialog] = useState<string | null>(null);
    const [openAuthenticateDialog, setOpenAuthenticateDialog] = useState<string | null>(null);
    const [openDisconnectDialog, setOpenDisconnectDialog] = useState<string | null>(null);
    const [showConnectDialog, setShowConnectDialog] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFail, setShowFail] = useState(false);
    const [connectPlatform, setConnectPlatform] = useState<Platform | null>(null);
    const [activePlatformName, setActivePlatformName] = useState<string | null>(null);

    return {
        openMenuId, setOpenMenuId,
        openStopSyncDialog, setOpenStopSyncDialog,
        openLinkAccountDialog, setOpenLinkAccountDialog,
        openAuthenticateDialog, setOpenAuthenticateDialog,
        openDisconnectDialog, setOpenDisconnectDialog,
        showConnectDialog, setShowConnectDialog,
        showSuccess, setShowSuccess,
        showFail, setShowFail,
        connectPlatform, setConnectPlatform,
        activePlatformName, setActivePlatformName,
    };
}
