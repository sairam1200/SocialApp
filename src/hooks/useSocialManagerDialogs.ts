"use client";

import { useState } from "react";
import type { PlatformId } from "@/constants/platforms";
import { ManualProfileType } from "@/types/account/profile.type";

export type LinkDialogMode = "add" | "edit";

export type ConnectionType = "manual" | "custom" | "oauth";

export type DisconnectTarget = {
  id: string;
  platformName: string;
  connectionType: ConnectionType;
} | null;

export function useSocialManagerDialogs() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [openLinkAdded, setOpenLinkAdded] = useState(false);

  const [selectedPlatform, setSelectedPlatform] = useState<
    PlatformId | "custom" | null
  >(null);

  const [editingManualProfile, setEditingManualProfile] =
    useState<ManualProfileType | null>(null);

  const [linkDialogMode, setLinkDialogMode] =
    useState<LinkDialogMode>("add");

  const [openDisconnectDialog, setOpenDisconnectDialog] = useState(false);
  const [disconnectTarget, setDisconnectTarget] =
    useState<DisconnectTarget>(null);

  const [openAuthenticateDialog, setOpenAuthenticateDialog] =
    useState(false);
  const [authPlatformId, setAuthPlatformId] =
    useState<PlatformId | null>(null);
  const [authPlatformName, setAuthPlatformName] = useState<string>("");

  const openDisconnect = (
    id: string,
    platformName: string,
    connectionType: ConnectionType
  ) => {
    setDisconnectTarget({ id, platformName, connectionType });
    setOpenDisconnectDialog(true);
  };

  const openAuthenticate = (id: PlatformId, name: string) => {
    setAuthPlatformId(id);
    setAuthPlatformName(name);
    setOpenAuthenticateDialog(true);
  };

  const resetAllDialogs = () => {
    setOpenAddDialog(false);
    setOpenLinkDialog(false);
    setOpenLinkAdded(false);
    setSelectedPlatform(null);
    setEditingManualProfile(null);
    setLinkDialogMode("add");
    setDisconnectTarget(null);
    setOpenDisconnectDialog(false);
    setOpenAuthenticateDialog(false);
    setAuthPlatformId(null);
    setAuthPlatformName("");
  };

  return {
    openAddDialog,
    setOpenAddDialog,

    openLinkDialog,
    setOpenLinkDialog,

    openLinkAdded,
    setOpenLinkAdded,

    selectedPlatform,
    setSelectedPlatform,

    editingManualProfile,
    setEditingManualProfile,

    linkDialogMode,
    setLinkDialogMode,

    openDisconnectDialog,
    setOpenDisconnectDialog,

    disconnectTarget,
    setDisconnectTarget,
    openDisconnect,

    openAuthenticateDialog,
    setOpenAuthenticateDialog,
    authPlatformId,
    authPlatformName,
    openAuthenticate,

    resetAllDialogs,
  };
}
