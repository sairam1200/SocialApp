"use client";

import React, { useRef, useEffect } from "react";
import ArrowDown from "@/components/svg/arrow-down.svg";
import VerifiedIcon from "@/components/svg/verification-badge-black.svg";
import DisconnectIcon from "@/components/svg/icon-link-not-connected.svg";
import CloseIcon from "@/components/svg/icon-close.svg";
import SyncIcon from "@/components/svg/sync-icon.svg";
import EditIcon from "@/components/svg/edit.svg";
import type { Platform, PlatformId } from "@/constants/platforms";
import { cn } from "@/utils/cn.util";
import { apiClient } from "@/services/apiClient.service";

export type ImportStatus = "not_imported" | "importing" | "imported";

export interface PlatformWithState extends Platform {
	connectionMethod?: "link" | "import";
	importStatus?: ImportStatus;
}

interface PlatformManageMenuProps {
	platform: PlatformWithState;
	menuId: string;
	openMenuId: string | null;
	setOpenMenuId: (id: string | null) => void;

	onImportStatusChange: (id: PlatformId, status: ImportStatus) => void;
	onAuthenticate: (id: string, name: string) => void;
	onStopImporting: (id: PlatformId, name: string) => Promise<void>;
	onDisconnect: (id: string, name: string) => void;
	onEditLink?: (id: string, name: string) => void;
}

export default function PlatformManageMenu({
	platform,
	menuId,
	openMenuId,
	setOpenMenuId,
	onImportStatusChange,
	onAuthenticate,
	onStopImporting,
	onDisconnect,
	onEditLink,
}: PlatformManageMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);
	const isOpen = openMenuId === menuId;

	const isOauthAvailable =
		!!(platform.capabilities?.oauth && platform.oauthStatus === "ready");
	const isLinkConnection = platform.connectionMethod === "link";
	const importStatus: ImportStatus = platform.importStatus ?? "not_imported";
	const hasImportCapability = platform.capabilities?.importContent ?? false;
	const canImport = isOauthAvailable && hasImportCapability && !isLinkConnection;

	useEffect(() => {
		if (importStatus !== "importing" || !canImport) return;

		let cancelled = false;
		const refreshStatus = async () => {
			try {
				const result = await apiClient.Integration.getImportStatus(platform.id);
				if (cancelled) return;
				if (result.status === "completed") {
					onImportStatusChange(platform.id, "imported");
				} else if (
					result.status === "cancelled" ||
					result.status === "failed"
				) {
					onImportStatusChange(platform.id, "not_imported");
				}
			} catch {
				// Keep the last known state during transient status outages.
			}
		};

		void refreshStatus();
		const interval = window.setInterval(refreshStatus, 2_000);
		return () => {
			cancelled = true;
			window.clearInterval(interval);
		};
	}, [canImport, importStatus, onImportStatusChange, platform.id]);

	// Close dropdown on outside click
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpenMenuId(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [setOpenMenuId]);

	// IMPORT
	const handleImportClick = async () => {
		if (!canImport) return;

		onImportStatusChange(platform.id, "importing");

		try {
			await apiClient.Integration.importContent(platform.id, {});
		} catch (err: unknown) {
			const error = err as {
				response?: {
					data?: {
						title?: string;
					};
				};
			};

			const title = error.response?.data?.title;

			if (title === "RECONNECT_REQUIRED") {
				onAuthenticate(platform.id, platform.name);
				return;
			}

			onImportStatusChange(platform.id, "not_imported");
		}

		setOpenMenuId(null);
	};

	// OTHER ACTIONS
	const handleEditClick = () => {
		onEditLink?.(platform.id, platform.name);
		setOpenMenuId(null);
	};

	const handleConnectClick = () => {
		if (!isOauthAvailable) return;
		onAuthenticate(platform.id, platform.name);
		setOpenMenuId(null);
	};

	const handleDisconnectClick = () => {
		onDisconnect(platform.id, platform.name);
		setOpenMenuId(null);
	};

	const handleStopImportingClick = async () => {
		try {
			await onStopImporting(platform.id, platform.name);
			setOpenMenuId(null);
		} catch {
			// Keep the menu and current server-derived state so the user can retry.
		}
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpenMenuId(isOpen ? null : menuId)}
				className="text-xs font-semibold text-[#512FB6] hover:bg-zinc-100 px-3 h-9 rounded-md cursor-pointer"
			>
				Manage <ArrowDown className="inline-block ml-1" />
			</button>

			{isOpen && (
				<div
					ref={menuRef}
					className="absolute right-0 -top-2.5 min-w-[252px] p-2 bg-white border border-[#E0D7FF] rounded-2xl shadow-[0px_16px_21px_0px_#00000040] z-10"
				>
					{/* MANUAL LINK */}
					{isLinkConnection ? (
						<>
							<button
								type="button"
								onClick={handleEditClick}
								className="w-full text-left px-2 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-4"
							>
								<EditIcon />
								Edit link
							</button>

							{isOauthAvailable && (
								<button
									type="button"
									onClick={handleConnectClick}
									className="w-full text-left px-2 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-4"
								>
									<VerifiedIcon />
									Connect link
								</button>
							)}

							<button
								type="button"
								onClick={handleDisconnectClick}
								className="w-full text-left text-[#F64028] px-2 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-4"
							>
								<DisconnectIcon />
								Remove link
							</button>
						</>
					) : (
						<>
							{/* OAUTH CONNECTION */}
							{importStatus === "not_imported" && (
								<>
									<button
										type="button"
										onClick={handleImportClick}
										className={cn(
											"w-full text-left px-2 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-4",
											canImport
												? "text-black cursor-pointer"
												: "text-gray-400 cursor-not-allowed"
										)}
										disabled={!canImport}
									>
										<SyncIcon />
										Import content
									</button>

									<button
										type="button"
										onClick={handleDisconnectClick}
										className="w-full text-left text-[#F64028] px-2 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-4"
									>
										<DisconnectIcon />
										Disconnect
									</button>
								</>
							)}

							{importStatus === "importing" && (
								<>
									<div className="text-center text-sm text-gray-500 py-2">
										Importing…
									</div>
									<button
										type="button"
										onClick={() => void handleStopImportingClick()}
										className="w-full text-left text-black px-2 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-4"
									>
										<CloseIcon />
										Stop importing
									</button>
								</>
							)}

							{importStatus === "imported" && (
								<>
									<button
										type="button"
										onClick={handleImportClick}
										className={cn(
											"w-full text-left px-2 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-4",
											canImport
												? "text-black cursor-pointer"
												: "text-gray-400 cursor-not-allowed"
										)}
										disabled={!canImport}
									>
										<SyncIcon />
										Import content
									</button>

									<button
										type="button"
										onClick={handleDisconnectClick}
										className="w-full text-left text-[#F64028] px-2 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-4"
									>
										<DisconnectIcon />
										Disconnect
									</button>
								</>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
}
