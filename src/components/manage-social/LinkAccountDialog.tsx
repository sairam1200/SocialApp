"use client";

import { useState, useEffect } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import IconUser from "@/components/svg/icon-user.svg";
import { platforms, type PlatformId } from "@/constants/platforms";
import { apiClient } from "@/services/apiClient.service";
import { ManualProfileType } from "@/types/account/profile.type";

type LinkDialogMode = "add" | "edit";

type LinkAccountDialogProps = {
	open: boolean;
	onCancel?: () => void;
	onClose?: () => void;
	onSuccess?: (profile: ManualProfileType) => void;

	platformName: string;
	platformId: PlatformId | "custom";

	mode: LinkDialogMode;
	initialProfile?: ManualProfileType | null;
};

export default function LinkAccountDialog({
	open,
	onCancel,
	onClose,
	onSuccess,
	platformName,
	platformId,
	mode,
	initialProfile,
}: LinkAccountDialogProps) {
	const [linkName, setLinkName] = useState("");
	const [username, setUsername] = useState("");
	const [error, setError] = useState("");
	const [serverError, setServerError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const platform = platformId !== "custom" ? platforms.find((p) => p.id === platformId) : null;

	const isCustomLink = !platform;

	// Prefill form on open
	useEffect(() => {
		if (!open) return;

		setError("");
		setServerError(null);

		if (mode === "edit" && initialProfile) {
			setLinkName(isCustomLink ? initialProfile.platform : platformName);

			if (platform) {
				const prefix = platform.urlPrefix ?? "";
				const raw = initialProfile.url.startsWith(prefix)
					? initialProfile.url.slice(prefix.length)
					: initialProfile.url;
				setUsername(raw);
			} else {
				setUsername(initialProfile.url);
			}
			return;
		}

		setUsername("");
		setLinkName(isCustomLink ? "" : platformName);
	}, [open, mode, initialProfile, platformName, isCustomLink, platform]);

	const handleClose = () => {
		setUsername("");
		setLinkName("");
		setError("");
		setServerError(null);

		if (onCancel) onCancel();
		else if (onClose) onClose();
	};

	const handleSubmit = async () => {
		const cleanUsername = username.trim();
		const cleanLinkName = linkName.trim();

		if (!cleanUsername) {
			setError(isCustomLink ? "URL is required" : "Username is required");
			return;
		}

		// EDIT MODE → PUT /manual-profile

		if (mode === "edit" && initialProfile) {
			let updatedPlatform = initialProfile.platform;
			let updatedUrl = initialProfile.url;
			let updatedIcon = initialProfile.icon;

			if (isCustomLink) {
				updatedPlatform = cleanLinkName || initialProfile.platform;
				updatedUrl = cleanUsername;
			} else {
				if (!platform) {
					setServerError("Platform config error");
					return;
				}
				updatedPlatform = platform.id;
				updatedIcon = platform.iconName ?? platform.id;
				updatedUrl = `${platform.urlPrefix ?? ""}${cleanUsername}`;
			}

			setSubmitting(true);
			const result = await apiClient.User.updateManualProfileAsync({
				id: initialProfile.id,
				url: updatedUrl,
				platform: updatedPlatform,
				icon: updatedIcon,
			});

			if (result.success) {
				const updatedProfile: ManualProfileType = {
					...initialProfile,
					url: updatedUrl,
					platform: updatedPlatform,
					icon: updatedIcon,
				};
				onSuccess?.(updatedProfile);
			} else {
				setServerError(result.error ?? "Could not update the link. Please check the data and try again.");
			}
			setSubmitting(false);

			return;
		}

		// ADD MODE → POST /manual-profile

		let url: string;
		let platformValue: string;
		let iconValue: string;

		if (isCustomLink) {
			url = cleanUsername;
			platformValue = cleanLinkName || "Custom";
			iconValue = "CUSTOM";
		} else {
			if (!platform) {
				setServerError("Platform config error");
				return;
			}
			url = `${platform.urlPrefix ?? ""}${cleanUsername}`;
			platformValue = platform.id;
			iconValue = platform.iconName ?? platform.id;
		}

		setSubmitting(true);
		const created = await apiClient.User.createManualProfileAsync({
			url,
			platform: platformValue,
			icon: iconValue,
		});

		if (created) {
			onSuccess?.(created);
		} else {
			setServerError("Could not save the link. Please check the data and try again.");
		}
		setSubmitting(false);
	};

	const usernameLabel = isCustomLink ? "Full URL" : `${platformName} username`;
	const usernamePlaceholder = isCustomLink ? "https://example.com" : `Enter your ${platformName} username`;

	return (
		<DialogContainer
			open={open}
			onClose={handleClose}
			title={mode === "edit" ? "Edit link" : isCustomLink ? "Add a custom link" : `Link your ${platformName} profile`}
			description={
				mode === "edit"
					? isCustomLink
						? "Update the link name and URL."
						: "Update the username for this link."
					: isCustomLink
						? "Enter a name and a URL for your custom link."
						: "Enter a link name and username to generate a link."
			}
			closeOnOverlayClick={false}
			closeOnEsc
			maxWidthClass="max-w-2xl"
			footer={
				<div className="flex justify-end gap-4 pb-4">
					<Button type="button" label="Cancel" variant="secondary" onClick={handleClose} />
					<Button
						type="button"
						label={mode === "edit" ? "Save changes" : "Add link"}
						onClick={handleSubmit}
						loading={submitting}
					/>
				</div>
			}
		>
			<div className="space-y-4">
				{/* Link Name */}
				<div>
					<label className="block text-sm font-medium text-black mb-1">Link name</label>

					<input
						type="text"
						placeholder="Link name"
						className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
						value={linkName}
						onChange={(e) => setLinkName(e.target.value)}
						disabled={!isCustomLink}
					/>

					{!isCustomLink && (
						<p className="mt-1 text-xs text-zinc-500">To change the platform, remove this link and add it again.</p>
					)}
				</div>

				{/* Username / URL */}
				<div>
					<label className="block text-sm font-medium text-black mb-1">{usernameLabel}</label>

					<div className="relative">
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
							<IconUser />
						</span>

						<input
							type="text"
							className="w-full rounded-lg border border-zinc-300 px-3 py-2 pl-8 text-sm"
							placeholder={usernamePlaceholder}
							value={username}
							onChange={(e) => {
								setUsername(e.target.value);
								setError("");
								setServerError(null);
							}}
						/>
					</div>

					{error && <p className="mt-1 text-sm text-[#F64028]">{error}</p>}
					{serverError && <p className="mt-1 text-sm text-[#F64028]">{serverError}</p>}
				</div>
			</div>
		</DialogContainer>
	);
}
