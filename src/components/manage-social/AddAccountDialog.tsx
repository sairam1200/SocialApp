"use client";

import React, { useState, useEffect } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import type { Platform } from "@/constants/platforms";
import { Select } from "@/components/ui/select";
import LinkIcon from "@/components/svg/link-icon.svg";
import VerifiedIcon from "@/components/svg/verified-icon-black.svg";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

type AddType = "link" | "connect";

type PlatformOption = {
	id: string;
	name: string;
};

type TypeCardProps = {
	title: string;
	desc: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	active: boolean;
	disabled?: boolean;
	onClick: () => void;
};

function TypeOptionCard({ title, desc, icon: Icon, active, disabled, onClick }: TypeCardProps) {
	return (
		<button
			type="button"
			onClick={disabled ? undefined : onClick}
			disabled={disabled}
			className={cn(
				"w-full text-left rounded-xl p-5 border-2 transition flex flex-col gap-2",
				active ? "gradient-bg-primary border-transparent text-white" : "border-[#E0D7FF] bg-white text-[#0D0D0D]",
				disabled && "opacity-50 cursor-not-allowed",
				!disabled && !active && "hover:border-[#512FB6]/70"
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<span className="font-normal text-base leading-6 mb-3">{title}</span>

				<span className="shrink-0 flex items-center justify-center">
					<Icon
						className={cn(
							"w-full h-full",
							active ? "text-white [&_path]:fill-white [&_path]:stroke-white" : "text-black [&_path]:fill-black"
						)}
					/>
				</span>
			</div>

			<p className={cn("text-xs leading-[18px]", active && "text-white/90")}>{desc}</p>
		</button>
	);
}

type AddAccountDialogProps = {
	open: boolean;
	onClose: () => void;
	platforms: Platform[];
	onSelect: (platformId: string, type: AddType) => void;
};

export function AddAccountDialog({ open, onClose, platforms: availablePlatforms, onSelect }: AddAccountDialogProps) {
	const [selectedPlatformId, setSelectedPlatformId] = useState<string | undefined>(undefined);
	const [selectedType, setSelectedType] = useState<AddType>("link");

	const handleConfirm = () => {
		if (!selectedPlatformId) return;
		onSelect(selectedPlatformId, selectedType);
	};

	const selectedPlatformConfig = selectedPlatformId
		? availablePlatforms.find((p) => p.id === selectedPlatformId)
		: undefined;

	const isConnectAvailable =
		!!selectedPlatformConfig &&
		selectedPlatformConfig.capabilities.oauth &&
		selectedPlatformConfig.oauthStatus === "ready";
	const isImportAvailable =
		isConnectAvailable && selectedPlatformConfig.capabilities.importContent;

	const selectedPlatformName = selectedPlatformId === "custom" ? "Custom" : selectedPlatformConfig?.name ?? "";

	const actionLabel = selectedType === "link" ? `Add ${selectedPlatformName} Link` : `Connect ${selectedPlatformName}`;

	useEffect(() => {
		if (selectedPlatformId === "custom" && selectedType === "connect") {
			setSelectedType("link");
		}
	}, [selectedPlatformId, selectedType]);

	const customOption: PlatformOption = { id: "custom", name: "Custom" };

	const filteredPlatforms: PlatformOption[] = availablePlatforms.map((p) => ({
		id: p.id,
		name: p.name,
	}));

	const platformOptions: PlatformOption[] = [customOption, ...filteredPlatforms];

	const suggestedOptions: PlatformOption[] = [...filteredPlatforms.slice(0, 4), customOption];

	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title="Add"
			description="Connect your social accounts and add links to your Gaddr account."
			maxWidthClass="max-w-2xl"
			footer={
				<div className="flex justify-end gap-4">
					<Button type="button" label="Cancel" variant="secondary" onClick={onClose} />
					<Button
						type="button"
						label={actionLabel}
						onClick={handleConfirm}
						disabled={!selectedPlatformId || (selectedType === "connect" && !isConnectAvailable)}
					/>
				</div>
			}
		>
			<div className="flex flex-col gap-4 text-sm">
				<div className="flex flex-col gap-2">
					<label className="text-sm font-semibold">
						Platform <span className="text-[#F64028]">*</span>
					</label>

					<Select
						value={selectedPlatformId}
						onValueChange={setSelectedPlatformId}
						placeholder="Search or select"
						options={platformOptions.map((p) => {
							const platformConfig = availablePlatforms.find((cfg) => cfg.id.toLowerCase() === p.id.toLowerCase());
							const Icon = p.id === "custom" ? LinkIcon : platformConfig?.icon;

							return {
								value: p.id,
								label: (
									<span className="flex items-center gap-4 leading-none overflow-visible">
										{Icon && (
											<span
												className="
                                                    inline-flex items-center justify-center
                                                    w-4 h-4 overflow-visible
                                                    -translate-y-0.5 scale-65
                                                    [&_path]:fill-black
                                                    [&>svg]:w-full [&>svg]:h-full [&>svg]:overflow-visible
                                                "
											>
												<Icon />
											</span>
										)}
										<span className="leading-none">{p.name}</span>
									</span>
								),
							};
						})}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<span className="text-[14px]">Suggested</span>

					<Carousel className="relative w-full" opts={{ align: "start" }}>
						<CarouselContent className="flex gap-0 py-1">
							{suggestedOptions.map((p) => {
								const platformConfig = availablePlatforms.find((cfg) => cfg.id.toLowerCase() === p.id.toLowerCase());
								const Icon = p.id === "custom" ? LinkIcon : platformConfig?.icon;
								const isActive = selectedPlatformId === p.id;

								return (
									<CarouselItem key={p.id} className="basis-[130px]">
										<button
											type="button"
											onClick={() => setSelectedPlatformId(p.id)}
											className={cn(
												"flex flex-col items-center justify-center w-full h-20 rounded-[3px] border text-xs transition",
												isActive
													? "border-[#512FB6] bg-[#512FB6] text-white shadow-[0_0_0_1px_rgba(93,47,232,0.25)]"
													: "border-[#FAFAFA] bg-white text-black shadow-[0_2px_3px_0_#6136FF40]"
											)}
										>
											<div className="mb-1 flex items-center justify-center">
												{Icon && (
													<Icon
														className={cn(
															isActive ? "text-white [&_path]:fill-white [&_path]:stroke-white" : "text-black"
														)}
													/>
												)}
											</div>
											<span className={cn("text-[14px] leading-5", isActive ? "text-white" : "text-black")}>
												{p.name}
											</span>
										</button>
									</CarouselItem>
								);
							})}
						</CarouselContent>
					</Carousel>
				</div>

				<div className="flex flex-col gap-2">
					<span className="text-sm font-semibold">
						Type <span className="text-[#F64028]">*</span>
					</span>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
						<TypeOptionCard
							title="Add Link"
							desc="Display your account as a link. You can assign a custom name for the link. When a user clicks on the link, they will be redirected to your account on that platform."
							icon={LinkIcon}
							active={selectedType === "link"}
							onClick={() => setSelectedType("link")}
						/>

						<TypeOptionCard
							title="Connect Account"
							desc={
								isImportAvailable
									? "Import, sync and post content on the platform directly from Gaddr Me. Once you connect this account, a verified badge will be shown beside the link."
									: "Import is unavailable for this platform right now."
							}
							icon={VerifiedIcon}
							active={selectedType === "connect"}
							onClick={() => isConnectAvailable && setSelectedType("connect")}
							disabled={!isConnectAvailable}
						/>
					</div>
				</div>
			</div>
		</DialogContainer>
	);
}
