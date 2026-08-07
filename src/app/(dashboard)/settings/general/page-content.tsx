"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import { ColorSchemeToggle } from "@/components/ui/color-scheme-toggle";
import { useHttpContextUser } from "@/providers/HttpContextProvider";
import { ClaimTypes } from "@/constants/globals";
import Arrow from "@/components/svg/arrow-down.svg";
import DeactivateAccountDialog from "@/components/dialog/profile-settings-dialogs/delete-account/DeactivateAccountDialog";
import DeleteAllAccountsDialog from "@/components/dialog/profile-settings-dialogs/delete-account/DeleteAllAccountsDialog";
import SocialDialogsManager from "../../(profile)/[username]/components/SocialDialogsManager";
import ChangeUsernameDialog from "@/components/dialog/profile-settings-dialogs/change-username-email/ChangeUsernameDialog";
import ChangeEmailDialog from "@/components/dialog/profile-settings-dialogs/change-username-email/ChangeEmailDialog";
import { LinkedAccountType, ManualProfileType } from "@/types/account/profile.type";
export default function GeneralSettingsPage() {
	const user = useHttpContextUser();
	const router = useRouter();
	const t = useTranslations("settings");
	const tAppearance = useTranslations("settings.appearance");
	const tProfile = useTranslations("settings.profileSection");
	const tDelete = useTranslations("settings.deleteAccount");
	const tGeneral = useTranslations("settings.generalPage");
	 

	const [openDeactivate, setOpenDeactivate] = useState(false);
	const [openDeleteAll, setOpenDeleteAll] = useState(false);
	const [openManageSocial, setOpenManageSocial] = useState(false);

	const [openChangeUsername, setOpenChangeUsername] = useState(false);
	const [openChangeEmail, setOpenChangeEmail] = useState(false);

	const [usernameView, setUsernameView] = useState(user?.[ClaimTypes.UserName] ?? "");
	const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccountType[]>([]);
	const [manualProfiles, setManualProfiles] = useState<ManualProfileType[]>([]);

	useEffect(() => setUsernameView(user?.[ClaimTypes.UserName] ?? ""), [user]);

	const profileSettingsItems: Array<
		| { label: string; description?: string; href: string; onClick?: never }
		| { label: string; description?: string; href?: never; onClick: () => void }
	> = [
			{
				label: tProfile("manageSocialMedia"),
				description: "",
				onClick: () => setOpenManageSocial(true),
			},
			{
				label: tProfile("changeUsername"),
				description: `@${usernameView || "username"}`,
				onClick: () => setOpenChangeUsername(true),
			},
			{
				label: tProfile("changeEmail"),
				description: user?.[ClaimTypes.Email] ?? "user@email.com",
				onClick: () => setOpenChangeEmail(true),
			},
		];

	return (
		<>
			<div className="space-y-8 ">
				{/* Header */}
				<div>
					<h2 className="text-xl font-bold mb-2">{tGeneral("title")}</h2>
					<p className="text-sm text-gray-neutral">{tGeneral("description")}</p>
				</div>

				{/* Appearance */}
				<section className="space-y-4">
					<h3 className="font-semibold text-[20px] mb-2">{tAppearance("title")}</h3>

					<div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
						<div className="min-w-0">
							<p className="font-medium">{tAppearance("colorScheme")}</p>
							<p className="text-sm text-muted-foreground">
								{tAppearance("colorSchemeHint")}
							</p>
						</div>
						<ColorSchemeToggle className="shrink-0" />
					</div>
				</section>

				{/* Profile settings */}
				<section className="space-y-4 ">
					<h3 className="font-semibold text-[20px] mb-2">{t("profile")}</h3>

					<div className="space-y-3">
						{profileSettingsItems.map((item) => {
							const content = (
								<>
									<div className="text-left">
										<p className="font-medium">{item.label}</p>
										{item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
									</div>

									<div>
										<Arrow className="rotate-270 w-4 h-4" />
									</div>
								</>
							);

							const baseClassName = cn(
								"flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-4 text-card-foreground transition-colors hover:bg-muted"
							);

						if ("onClick" in item) {
							return (
								<button key={item.label} type="button" onClick={item.onClick} className={baseClassName} aria-label={item.label}>
									{content}
								</button>
							);
						}

						return (
							<Link key={item.label} href={item.href} className={baseClassName} aria-label={item.label}>
								{content}
							</Link>
						);
						})}
					</div>
				</section>

				<section className="space-y-4">
					<h3 className="font-semibold text-[20px] mb-4">{tDelete("title")}</h3>

					{/* --- Deactivate account --- */}
					<div className="flex flex-wrap justify-between gap-4 rounded-xl border border-border bg-card p-4 lg:grid lg:grid-cols-[2fr_1fr]">
						<div>
							<p className="text-[16px] text-foreground">{tDelete("deactivateAccount")}</p>
							<p className="text-[12px] text-muted-foreground">{tDelete("deactivateAccountHint")}</p>
						</div>

						<Button
							type="button"
							label={tDelete("deactivateAccountButton")}
							variant="outline"
							onClick={() => setOpenDeactivate(true)}
							aria-label={tDelete("deactivateAccountButton")}
						/>
					</div>

					{/* --- Permanently delete account --- */}
					<div className="flex flex-wrap justify-between gap-4 rounded-xl border border-border bg-card p-4 lg:grid lg:grid-cols-[2fr_1fr]">
						<div>
							<p className="text-[16px] text-destructive">{tDelete("deleteAccountPermanently")}</p>
							<p className="text-[12px] text-destructive">{tDelete("deleteAccountPermanentlyHint")}</p>
						</div>

						<Button
							type="button"
							label={tDelete("deleteAccountPermanentlyButton")}
							variant="destructive"
							onClick={() => setOpenDeleteAll(true)}
							aria-label={tDelete("deleteAccountPermanentlyButton")}
						/>
					</div>
				</section>
			</div>

			{/* --- DIALOGS --- */}
			<SocialDialogsManager
				open={openManageSocial}
				linkedAccounts={linkedAccounts}
				manualProfiles={manualProfiles}
				setLinkedAccounts={setLinkedAccounts}
				setManualProfiles={setManualProfiles}
				onClose={() => setOpenManageSocial(false)}
				onOpen={() => setOpenManageSocial(true)}
				username={user?.[ClaimTypes.UserName] ?? ""}
			/>

			<ChangeUsernameDialog
				open={openChangeUsername}
				onClose={() => setOpenChangeUsername(false)}
				initialUsername={usernameView}
				onSuccess={(newUsername) => setUsernameView(newUsername)}
			/>

			<ChangeEmailDialog
				open={openChangeEmail}
				onClose={() => setOpenChangeEmail(false)}
				initialEmail={user?.[ClaimTypes.Email] ?? ""}
				onSuccess={(newEmail) => {
					router.push(`/confirm-email/${encodeURIComponent(newEmail)}`);
				}}
			/>

			<DeactivateAccountDialog open={openDeactivate} onClose={() => setOpenDeactivate(false)} />

			<DeleteAllAccountsDialog open={openDeleteAll} onClose={() => setOpenDeleteAll(false)} />
		</>
	);
}
