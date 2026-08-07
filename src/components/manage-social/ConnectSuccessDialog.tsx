"use client";

import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import VerifiedIcon from "@/components/svg/verification-badge.svg";
import { platforms, type PlatformId } from "@/constants/platforms";
import { LinkedAccountType } from "@/types/account/profile.type";

type ConnectSuccessDialogProps = {
	open: boolean;
	onClose: () => void;
	platformId: PlatformId;
	account: LinkedAccountType | null;
	onSkip: () => void;
	onImport: () => void;
};

export default function ConnectSuccessDialog({
	open,
	onClose,
	platformId,
	account,
	onSkip,
	onImport,
}: ConnectSuccessDialogProps) {
	const platform = platforms.find((p) => p.id === platformId);
	const Icon = platform?.icon;

	const username = account?.username ?? "username";
	const followers = account?.followersCount ?? 0;
	const following = account?.followingCount ?? 0;
	const isVerified = account?.isVerified ?? false;

	const handleImportClick = () => {
		onImport();
	};

	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title="The account is connected!"
			description="Do you want to import content?"
			maxWidthClass="max-w-2xl"
			closeOnOverlayClick={false}
			closeOnEsc
			footer={
				<div className="flex justify-end gap-4">
					<Button type="button" label="Skip for now" variant="secondary" onClick={onSkip} />
					<Button type="button" label="Import content" onClick={handleImportClick} />
				</div>
			}
		>
			<div className="mt-2 space-y-4">
				{/* account info */}
				<div className="flex items-center gap-4 rounded-xl border border-[#E0D7FF] bg-[#F9F5FF] px-4 py-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#E0D7FF]">
						{Icon && <Icon />}
					</div>

					<div className="flex-1">
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold">@{username}</span>
							{isVerified && <VerifiedIcon className="inline-block" />}
						</div>

						<div className="mt-1 flex flex-wrap gap-4 text-xs text-gray-500">
							<span>
								Followers <span className="font-semibold text-[#0D0D0D]">{followers.toLocaleString()}</span>
							</span>
							<span>
								Following <span className="font-semibold text-[#0D0D0D]">{following.toLocaleString()}</span>
							</span>
						</div>
					</div>
				</div>

				<p className="text-sm text-[#333333]">
					Your {platform?.name ?? "social"} account is connected to your Gaddr profile. You can now import content from
					this account. The process will run in the background.
				</p>
			</div>
		</DialogContainer>
	);
}
