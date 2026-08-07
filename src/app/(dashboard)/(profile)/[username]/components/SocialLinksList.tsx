"use client";

import CheckIcon from "@/components/svg/check-circle-gradient.svg";
import { UserAvatar } from "@/components/ui/user-avatar";
import { platforms, type PlatformId } from "@/constants/platforms";
import type { LinkedAccountType } from "@/types/account/profile.type";

const platformById = new Map(platforms.map((platform) => [platform.id, platform]));
const compactNumber = new Intl.NumberFormat(undefined, {
	notation: "compact",
	maximumFractionDigits: 1,
});

function metric(value: number | undefined): string {
	return compactNumber.format(Math.max(0, value ?? 0));
}

export default function SocialLinksList({ accounts }: { accounts: LinkedAccountType[] }) {
	if (accounts.length === 0) {
		return (
		<div className="rounded-xl border border-border bg-muted/40 px-4 py-10 text-center">
			<p className="text-sm font-medium text-foreground">No connected platforms</p>
			<p className="mt-1 text-sm text-muted-foreground">
				Connect an account from Manage social media to show it here.
			</p>
		</div>
		);
	}

	return (
		<div className="space-y-4" aria-label="Connected platforms">
			{accounts.map((account) => {
				const platformId = account.platform.toLowerCase();
				const platform = platformById.get(platformId as PlatformId);
				const Icon = platform?.icon;
				const label = platform?.name ?? account.platform;
				const lastSynced = account.lastSyncedAt
					? new Date(account.lastSyncedAt).toLocaleString()
					: "Not available";

				return (
					<section key={account.id} className="rounded-xl border border-border bg-card p-4">
						<div className="flex min-w-0 items-center gap-4">
							<div className="relative shrink-0">
								<UserAvatar src={account.profileImage || undefined} alt={`${label} profile`} size="md" />
								{Icon ? (
									<span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
										<Icon className="h-4 w-4" aria-hidden="true" />
									</span>
								) : null}
							</div>

							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="font-semibold text-foreground">{label}</h3>
									{account.isVerified ? (
										<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
											<CheckIcon className="h-4 w-4" aria-hidden="true" />
											Verified
										</span>
									) : null}
								</div>
								<p className="truncate text-sm text-muted-foreground">@{account.username}</p>
								<dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
									<div>
										<dt className="text-muted-foreground">Followers</dt>
										<dd className="font-semibold text-foreground">{metric(account.followersCount)}</dd>
									</div>
									<div>
										<dt className="text-muted-foreground">Following</dt>
										<dd className="font-semibold text-foreground">{metric(account.followingCount)}</dd>
									</div>
									<div>
										<dt className="text-muted-foreground">Sync status</dt>
										<dd className="font-semibold text-foreground">
											{account.syncEnabled ? "Sync enabled" : account.isImported ? "Imported" : "Connected"}
										</dd>
									</div>
									<div>
										<dt className="text-muted-foreground">Last sync</dt>
										<dd className="font-semibold text-foreground">{lastSynced}</dd>
									</div>
								</dl>
							</div>
						</div>
					</section>
				);
			})}
		</div>
	);
}
