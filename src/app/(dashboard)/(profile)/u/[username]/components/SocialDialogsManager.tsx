"use client";
import dynamic from "next/dynamic";

import { ManageAccountsDialog } from "@/components/manage-social/ManageAccountsDialog";

//lazy loading the secondary dialogs by dynamically importing them
const DisconnectDialog = dynamic(() => import("@/components/manage-social/DisconnectDialog"), { ssr: false });
const AddAccountDialog = dynamic(() => import("@/components/manage-social/AddAccountDialog").then(mod => mod.AddAccountDialog), { ssr: false });
const LinkAccountDialog = dynamic(() => import("@/components/manage-social/LinkAccountDialog"), { ssr: false });
const LinkAddedDialog = dynamic(() => import("@/components/manage-social/LinkAddedDialog"), { ssr: false });
const ConnectSuccessDialog = dynamic(() => import("@/components/manage-social/ConnectSuccessDialog"), { ssr: false });
const ConnectFailedDialog = dynamic(() => import("@/components/manage-social/ConnectFailedDialog"), { ssr: false });
const AuthenticatePlatformDialog = dynamic(() => import("@/components/manage-social/AuthenticatePlatformDialog"), { ssr: false });


import React, { useMemo, useState } from "react";
import { useOAuthFlow } from "@/hooks/useOAuthFlow";
import { useSocialManagerDialogs } from "@/hooks/useSocialManagerDialogs";
import type { PlatformId } from "@/constants/platforms";
import type { ImportStatus } from "@/components/manage-social/PlatformManageMenu";
import type { Dispatch, SetStateAction } from "react";
import { platforms as allPlatforms, SUPPORTED_PLATFORM_IDS_BY_API, type Platform } from "@/constants/platforms";
import { LinkedAccountType, ManualProfileType } from "@/types/account/profile.type";
import { apiClient } from "@/services/apiClient.service";
import toast from "react-hot-toast";


export type SocialDialogsManagerProps = {
	open: boolean;
	onClose: () => void;
	onOpen: () => void;
	username: string;
	linkedAccounts: LinkedAccountType[];
	manualProfiles: ManualProfileType[];
	setLinkedAccounts: Dispatch<SetStateAction<LinkedAccountType[]>>;
	setManualProfiles: Dispatch<SetStateAction<ManualProfileType[]>>;
};

export default function SocialDialogsManager({
	open,
	onClose,
	onOpen,
	username,
	linkedAccounts,
	manualProfiles,
	setLinkedAccounts,
	setManualProfiles,
}: SocialDialogsManagerProps) {
	const initialPlatforms = useMemo(
		() =>
			allPlatforms.filter((p) =>
				SUPPORTED_PLATFORM_IDS_BY_API.includes(p.id)
			),
		[]
	);

	const [platformsState, setPlatformsState] = useState<Platform[]>(initialPlatforms);
	const [isDisconnecting, setIsDisconnecting] = useState(false);


	React.useEffect(() => {
		setPlatformsState((prev) =>
			prev.map((p) => {
				const linkedAcc = linkedAccounts.find(
					(la) => la.platform.toLowerCase() === p.id.toLowerCase()
				);
				if (linkedAcc) {
					return {
						...p,
						connected: true,
						connectionMethod: "import" as const,
						importStatus: linkedAcc.isImported ? "imported" : "not_imported",
					};
				}

				const manualProfile = manualProfiles.find(
					(mp) => mp.platform.toLowerCase() === p.id.toLowerCase()
				);
				if (manualProfile) {
					return {
						...p,
						connected: true,
						connectionMethod: "link" as const,
					};
				}

				return { ...p, connected: p.connected ?? false };
			})
		);
	}, [linkedAccounts, manualProfiles]);

	const {
		startOAuthFlow,
		handleImportFromSuccess,
		openConnectSuccess,
		oauthPlatformId,
		oauthAccount,
		closeConnectDialog,
		skipConnectDialog,
		openConnectFailed,
		failedPlatformName,
		closeFailedDialog,
	} = useOAuthFlow({
		username,
		onOpenManageDialog: onOpen,
		setPlatformsState,
		setLinkedAccounts,
		manualProfiles,
		setManualProfiles,
	});

	const {
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
		openDisconnect,
		openAuthenticateDialog,
		setOpenAuthenticateDialog,
		authPlatformId,
		authPlatformName,
		openAuthenticate,
		resetAllDialogs,
	} = useSocialManagerDialogs();

	const platformName =
		selectedPlatform === "custom"
			? "Custom"
			: platformsState.find((p) => p.id === selectedPlatform)?.name || "";

	function resetAll() {
		resetAllDialogs();
		closeConnectDialog();
	}

	// EDIT manual link
	const handleEditLink = (platformId: string) => {
		const profile = manualProfiles.find(
			(p) => p.platform.toLowerCase() === platformId.toLowerCase()
		);

		if (!profile) {
			console.error("Cannot edit link: profile not found for", platformId);
			return;
		}

		setEditingManualProfile(profile);
		setSelectedPlatform(platformId as PlatformId);
		setLinkDialogMode("edit");
		setOpenLinkDialog(true);
	};

	// handle import state update
	const handleImportStatusChange = (
		platformId: PlatformId,
		status: ImportStatus
	) => {
		setLinkedAccounts((prev) =>
			prev.map((acc) =>
				acc.platform.toLowerCase() === platformId.toLowerCase()
					? { ...acc, isImported: status === "imported" }
					: acc
			)
		);

		setPlatformsState((prev) =>
			prev.map((p) =>
				p.id === platformId ? { ...p, importStatus: status } : p
			)
		);
	};

	const handleReorder = React.useCallback(
		async (draggedItem: ManualProfileType, newIndex: number) => {
			const currentProfiles = [...manualProfiles].sort((a, b) => {
				const orderA = a.displayOrder ?? 0;
				const orderB = b.displayOrder ?? 0;
				return orderA - orderB;
			});

			const oldIndex = currentProfiles.findIndex((p) => p.id === draggedItem.id);
			if (oldIndex === -1) return;

			const reorderedProfiles = [...currentProfiles];
			reorderedProfiles.splice(oldIndex, 1);
			reorderedProfiles.splice(newIndex, 0, draggedItem);

			const updatedProfiles = reorderedProfiles.map((profile, index) => ({
				...profile,
				displayOrder: index,
			}));

			setManualProfiles(updatedProfiles);

			try {
				const result = await apiClient.User.reorderManualProfileAsync({
					id: draggedItem.id,
					displayOrder: newIndex,
				});

				if (result.success) {
					toast.success("Order updated successfully");
				} else {
					toast.error(result.error ?? "Failed to update order. Please try again.");
					setManualProfiles(manualProfiles);
				}
			} catch (error) {
				console.error("[REORDER] Failed to sync order with backend:", error);
				toast.error("Failed to sync order. Please try again.");
				setManualProfiles(manualProfiles);
			}
		},
		[manualProfiles, setManualProfiles]
	);

return (
		<>
			<ManageAccountsDialog
				open={open}
				onClose={() => {
					resetAll();
					onClose();
				}}
				linkedAccounts={linkedAccounts}
				manualProfiles={manualProfiles}
				onAddClick={() => setOpenAddDialog(true)}
				onEditLink={handleEditLink}
				onDisconnect={(id, platformLabel, connectionType) =>
					openDisconnect(id, platformLabel, connectionType)
				}
				onImportStatusChange={handleImportStatusChange}
				onAuthenticate={(id: string, name: string) =>
					openAuthenticate(id as PlatformId, name)
				}
				onReorder={handleReorder}
				loading={false}
			/>

			{/* Add Account */}
			<AddAccountDialog
				open={openAddDialog}
				onClose={() => setOpenAddDialog(false)}
				platforms={platformsState}
				onSelect={(platformId, type) => {
					setOpenAddDialog(false);
					const pid =
						platformId === "custom"
							? "custom"
							: (platformId as PlatformId);

					setSelectedPlatform(pid);

					if (pid === "custom" || type === "link") {
						setLinkDialogMode("add");
						setOpenLinkDialog(true);
						return;
					}

					void startOAuthFlow(pid as PlatformId);
				}}
			/>

			{/* Add/Edit Link */}
			<LinkAccountDialog
				open={openLinkDialog}
				platformId={(selectedPlatform ?? "custom") as PlatformId | "custom"}
				platformName={platformName}
				mode={linkDialogMode}
				initialProfile={editingManualProfile}
				onCancel={() => {
					setOpenLinkDialog(false);
					setEditingManualProfile(null);
					setLinkDialogMode("add");
				}}
				onSuccess={(profile) => {
					if (linkDialogMode === "add") {
						setManualProfiles((prev) => [...prev, profile]);
					} else {
						setManualProfiles((prev) =>
							prev.map((p) =>
								p.id === profile.id ? profile : p
							)
						);
					}
					setOpenLinkDialog(false);
					setEditingManualProfile(null);
					setLinkDialogMode("add");
					setOpenLinkAdded(true);
				}}
			/>

			<LinkAddedDialog
				open={openLinkAdded}
				platformName={platformName}
				onClose={() => {
					setOpenLinkAdded(false);
					onOpen();
				}}
			/>

			{/* OAuth Success */}
			<ConnectSuccessDialog
				open={openConnectSuccess && !!oauthPlatformId}
				onClose={closeConnectDialog}
				platformId={oauthPlatformId as PlatformId}
				account={oauthAccount}
				onSkip={skipConnectDialog}
				onImport={handleImportFromSuccess}
			/>

			<ConnectFailedDialog
				open={openConnectFailed}
				platformName={failedPlatformName ?? ""}
				onClose={() => {
					closeFailedDialog();
					onOpen();
				}}
			/>

			<AuthenticatePlatformDialog
				open={openAuthenticateDialog}
				onClose={() => setOpenAuthenticateDialog(false)}
				platformName={authPlatformName}
				onConfirm={() => {
					if (!authPlatformId) return;
					void startOAuthFlow(authPlatformId);
					setOpenAuthenticateDialog(false);
				}}
			/>

			{/* DisconnectDialog */}
			<DisconnectDialog
				open={openDisconnectDialog}
				onClose={() => setOpenDisconnectDialog(false)}
				onCancel={() => setOpenDisconnectDialog(false)}
				platformName={disconnectTarget?.platformName ?? ""}
				connectionType={disconnectTarget?.connectionType ?? "manual"}
				onConfirm={async () => {
					if (!disconnectTarget) return;
					const { id, connectionType, platformName } = disconnectTarget;

					setIsDisconnecting(true);

					try {
						if (connectionType === "manual" || connectionType === "custom") {
							const result = await apiClient.User.removeManualProfileAsync(id);
							if (result.success) {
								setManualProfiles((prev) => {
									const updated = prev.filter((mp) => mp.id !== id);

									setPlatformsState((prevPlatforms) =>
										prevPlatforms.map((p) => {
											if (p.id.toLowerCase() !== platformName.toLowerCase()) {
												return p;
											}

											const stillManual = updated.some(
												(mp) => mp.platform.toLowerCase() === platformName.toLowerCase()
											);

											const stillOAuth = linkedAccounts.some(
												(la) => la.platform.toLowerCase() === platformName.toLowerCase()
											);

											if (stillManual || stillOAuth) return p;

											return {
												...p,
												connected: false,
												connectionMethod: undefined,
												importStatus: "not_imported" as const,
											};
										})
									);

									return updated;
								});
								toast.success("Account disconnected successfully");
							} else {
								toast.error(result.error ?? "Failed to disconnect account");
							}
						} else {
							try {
								const result = await apiClient.Integration.disconnect(
									platformName.toLowerCase()
								);
								if (result.success) {
									setLinkedAccounts((prev) =>
										prev.filter(
											(la) =>
												la.platform.toLowerCase() !== platformName.toLowerCase()
										)
									);
									setPlatformsState((prev) =>
										prev.map((p) =>
											p.id.toLowerCase() === platformName.toLowerCase()
												? {
													...p,
													connected: false,
													connectionMethod: undefined,
													importStatus: "not_imported" as const,
												}
												: p
										)
									);
									toast.success(`${platformName} disconnected successfully`);
								} else {
									toast.error(
										result.message ?? `Failed to disconnect ${platformName}`
									);
								}
							} catch {
								toast.error(`Failed to disconnect ${platformName}`);
							}
						}
					} finally {
						setIsDisconnecting(false);
						setOpenDisconnectDialog(false);
					}
				}}
				loading={isDisconnecting}
			/>
		</>
	);
}
