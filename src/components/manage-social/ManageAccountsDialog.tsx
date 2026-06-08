"use client";

import React from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import PlusIcon from "@/components/svg/plus.svg";
import LinkIcon from "@/components/svg/link-icon.svg";
import VerifiedIcon from "@/components/svg/verification-badge.svg";
import HandlerIcon from "@/components/svg/handle-icon.svg";
import { EllipsisVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { platforms, type PlatformId } from "@/constants/platforms";

import PlatformManageMenu, {
	type PlatformWithState,
	type ImportStatus,
} from "@/components/manage-social/PlatformManageMenu";
import { LinkedAccountType, ManualProfileType } from "@/types/account/profile.type";

interface ManageAccountsDialogProps {
	open: boolean;
	onClose: () => void;
	linkedAccounts: LinkedAccountType[];
	manualProfiles: ManualProfileType[];
	onAddClick: () => void;
	onEditLink: (platformId: string) => void;
	onDisconnect: (id: string, platformName: string, connectionType: "manual" | "custom" | "oauth") => void;
	onImportStatusChange: (platformId: PlatformId, status: ImportStatus) => void;
	onAuthenticate?: (id: string, name: string) => void;
	onReorder?: (draggedItem: ManualProfileType, newIndex: number) => void;
	loading?: boolean;
}

const getPlatformConfig = (platformId: string) =>
	platforms.find((p) => p.id.toLowerCase() === platformId.toLowerCase());

function SkeletonRow() {
	return (
		<li className="flex items-center justify-between border-b border-[#D9D9D9] px-3 py-3">
			<div className="flex items-center gap-3 w-full">
				<span className="h-5 w-5 rounded-full bg-zinc-200 animate-pulse" />
				<span className="h-5 w-5 rounded-full bg-zinc-200 animate-pulse" />
				<div className="flex flex-col gap-1 flex-1">
					<span className="h-4 w-40 rounded bg-zinc-200 animate-pulse" />
					<span className="h-3 w-64 rounded bg-zinc-200 animate-pulse" />
				</div>
				<span className="h-7 w-20 rounded bg-zinc-200 animate-pulse" />
			</div>
		</li>
	);
}

export function ManageAccountsDialog({
	open,
	onClose,
	linkedAccounts,
	manualProfiles,
	onAddClick,
	onEditLink,
	onDisconnect,
	onImportStatusChange,
	onAuthenticate,
	onReorder,
	loading = false,
}: ManageAccountsDialogProps) {
	const hasAny = linkedAccounts?.length > 0 || manualProfiles?.length > 0;

	const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
	const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
	const [isReorderMode, setIsReorderMode] = React.useState(false);
	const [headerMenuOpen, setHeaderMenuOpen] = React.useState(false);

	const sortedManualProfiles = React.useMemo(() => {
		return [...manualProfiles]?.sort((a, b) => {
			const orderA = a.displayOrder ?? 0;
			const orderB = b.displayOrder ?? 0;
			return orderA - orderB;
		});
	}, [manualProfiles]);

	const [localManualProfiles, setLocalManualProfiles] = React.useState(sortedManualProfiles);

	React.useEffect(() => {
		setLocalManualProfiles(sortedManualProfiles);
	}, [sortedManualProfiles]);

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/html", "");
		e.stopPropagation();
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = "move";
		if (draggedIndex !== null && draggedIndex !== index) {
			setDragOverIndex(index);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.stopPropagation();
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setDragOverIndex(null);
		}
	};

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault();
		e.stopPropagation();
		setDragOverIndex(null);

		if (draggedIndex === null || draggedIndex === dropIndex || !onReorder) {
			setDraggedIndex(null);
			return;
		}

		const newProfiles = [...localManualProfiles];
		const [draggedItem] = newProfiles.splice(draggedIndex, 1);
		newProfiles.splice(dropIndex, 0, draggedItem);

		const reorderedProfiles = newProfiles.map((profile, index) => ({
			...profile,
			displayOrder: index,
		}));

		setLocalManualProfiles(reorderedProfiles);
		onReorder(draggedItem, dropIndex);
		setDraggedIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleImportStatusChange = React.useCallback(
		(id: PlatformId, status: ImportStatus) => {
			onImportStatusChange(id, status);
		},
		[onImportStatusChange]
	);

	const handleAuthenticate = React.useCallback(
		(id: string, name: string) => {
			onAuthenticate?.(id, name);
		},
		[onAuthenticate]
	);

	const handleStopImporting = React.useCallback((id: string, name: string) => {
		console.log("[ManageAccountsDialog] stopImporting", id, name);
	}, []);

	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title="Manage accounts and links"
			description="Connect your social accounts and add links to your Gaddr account."
			maxWidthClass="max-w-2xl"
			footer={
				<div className="flex justify-end m-0">
					<Button type="button" label="Done" onClick={onClose} />
				</div>
			}
		>
			<div className="flex flex-col gap-2" aria-busy={loading} aria-live="polite">
				<div className={`transition-opacity duration-300 ${isReorderMode ? "opacity-30 pointer-events-none" : ""}`}>
					<Button
						type="button"
						onClick={onAddClick}
						label="Add"
						variant="secondary"
						icon={<PlusIcon className="size-6 scale-65" />}
						iconPosition="left"
						className="w-full justify-center gap-4 rounded-full"
					/>
				</div>

				{loading ? (
					<ul className="flex flex-col gap-2">
						<SkeletonRow />
						<SkeletonRow />
						<SkeletonRow />
					</ul>
				) : !hasAny ? (
					<div className="rounded-xl border border-[#E6E6E6] bg-[#FAFAFA] px-4 py-5 text-center">
						<p className="text-sm text-[#595959]">Get started by adding an account or a link!</p>
					</div>
				) : (
					<ul className="flex flex-col gap-2">
						{localManualProfiles.length > 0 && (
							<>
								<div className={`flex items-center justify-between mb-2 ${isReorderMode ? "mt-4" : ""}`}>
									<p className={`text-xss transition-opacity duration-300 ${isReorderMode ? "opacity-30" : ""}`}>Your links</p>
									{localManualProfiles.length > 1 && (
										<>
											{isReorderMode ? (
												<Button
													type="button"
													label="Done"
													variant="secondary"
													onClick={() => setIsReorderMode(false)}
													className="text-sm"
												/>
											) : (
												<Popover open={headerMenuOpen} onOpenChange={setHeaderMenuOpen}>
													<PopoverTrigger asChild>
														<button
															type="button"
															className="flex items-center justify-center h-9 px-3 hover:bg-gray-100 rounded cursor-pointer transition-colors"
															aria-label="Options"
														>
															<EllipsisVertical size={18} className="text-gray-600" />
														</button>
													</PopoverTrigger>
													<PopoverContent
														className="w-auto p-1 z-50"
														sideOffset={5}
														align="end"
													>
														<button
															type="button"
															onClick={() => {
																setIsReorderMode(true);
																setHeaderMenuOpen(false);
															}}
															className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
														>
															Reorder
														</button>
													</PopoverContent>
												</Popover>
											)}
										</>
									)}
								</div>
								{localManualProfiles.map((mp, index) => {
									const platformConfig = getPlatformConfig(mp.platform);
									const isCustom = !platformConfig;

									const menuId = `manual-${mp.id}`;
									const label = platformConfig?.name ?? mp.platform;

									const connectionType = isCustom ? "custom" : "manual";

									let platformForMenu: PlatformWithState;

									if (platformConfig) {
										platformForMenu = {
											...platformConfig,
											capabilities: {
												...platformConfig.capabilities,
												manualLink: true,
											},
											connectionMethod: "link",
											importStatus: "not_imported",
										};
									} else {
										platformForMenu = {
											id: mp.platform as PlatformId,
											name: mp.platform,
											icon: LinkIcon,
											capabilities: {
												manualLink: true,
												oauth: false,
												importContent: false,
											},
											connected: true,
											urlPrefix: "",
											connectionMethod: "link",
											importStatus: "not_imported",
										};
									}

									const Icon = platformConfig?.icon ?? LinkIcon;

									return (
										<li
											key={mp.id}
											draggable={onReorder && isReorderMode}
											onDragStart={onReorder && isReorderMode ? (e) => handleDragStart(e, index) : undefined}
											onDragOver={(e) => handleDragOver(e, index)}
											onDragLeave={handleDragLeave}
											onDrop={(e) => handleDrop(e, index)}
											onDragEnd={handleDragEnd}
											className={`flex items-center justify-between border-b border-[#D9D9D9] px-3 py-3 text-sm transition-colors ${onReorder && isReorderMode ? "cursor-move" : ""
												} ${draggedIndex === index ? "opacity-50" : ""} ${dragOverIndex === index ? "bg-primary/10 border-primary" : ""}`}
										>
											<div className="flex items-center gap-3">
												{onReorder && isReorderMode && (
													<HandlerIcon />
												)}
												<Icon />
												<div className="flex flex-col">
													<span className="font-medium">{label}</span>
													<span className="text-xs text-[#333333]">{mp.url}</span>
												</div>
											</div>

											{!isReorderMode && (
												<PlatformManageMenu
													platform={platformForMenu}
													menuId={menuId}
													openMenuId={openMenuId}
													setOpenMenuId={setOpenMenuId}
													onImportStatusChange={handleImportStatusChange}
													onAuthenticate={handleAuthenticate}
													onStopImporting={handleStopImporting}
													onEditLink={() => onEditLink(mp.platform)}
													onDisconnect={() => onDisconnect(mp.id, mp.platform, connectionType)}
												/>
											)}
										</li>
									);
								})}
							</>
						)}

						{linkedAccounts.length > 0 && (
							<div className={`transition-opacity duration-300 ${isReorderMode ? "opacity-30 pointer-events-none" : ""}`}>
								<p className="text-xss mt-2">Your accounts</p>
								{linkedAccounts.map((acc) => {
									const platformConfig = getPlatformConfig(acc.platform);
									if (!platformConfig) return null;

									const imported = acc.isImported;
									const connectionType = "oauth";

									const platformForMenu: PlatformWithState = {
										...platformConfig,
										connectionMethod: "import",
										importStatus: imported ? "imported" : "not_imported",
									};

									const Icon = platformConfig.icon;

									return (
										<li
											key={acc.id}
											className="flex items-center justify-between border-b border-[#D9D9D9] px-3 py-3 text-sm"
										>
											<div className="flex items-center gap-3">
												<Icon />
												<div className="flex flex-col gap-0.5">
													<span className="flex items-center gap-1 font-medium">
														{platformConfig.name}
														<VerifiedIcon />
													</span>
													<span className="text-xs text-[#333333]">@{acc.username}</span>
													<span className="text-xs text-[#333333]">
														{imported ? "Content imported and synced" : "Content not imported"}
													</span>
												</div>
											</div>

											<PlatformManageMenu
												platform={platformForMenu}
												menuId={`oauth-${acc.id}`}
												openMenuId={openMenuId}
												setOpenMenuId={setOpenMenuId}
												onImportStatusChange={handleImportStatusChange}
												onAuthenticate={handleAuthenticate}
												onStopImporting={handleStopImporting}
												onDisconnect={() => onDisconnect(acc.id, platformConfig.name, connectionType)}
											/>
										</li>
									);
								})}
							</div>
						)}
					</ul>
				)}
			</div>
		</DialogContainer>
	);
}
