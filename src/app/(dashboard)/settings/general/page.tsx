"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import { useHttpContextUser } from "@/providers/HttpContextProvider";
import { ClaimTypes } from "@/constants/globals";
import Arrow from "@/components/svg/arrow-down.svg";
import DeleteGaddrMeSearchAccountDialog from "@/components/dialog/profile-settings-dialogs/delete-account/DeleteGaddrMeSearchAccountDialog";
import DeleteAllAccountsDialog from "@/components/dialog/profile-settings-dialogs/delete-account/DeleteAllAccountsDialog";
import SocialDialogsManager from "../../(profile)/u/[username]/components/SocialDialogsManager";
import ChangeUsernameDialog from "@/components/dialog/profile-settings-dialogs/change-username-email/ChangeUsernameDialog";
import ChangeEmailDialog from "@/components/dialog/profile-settings-dialogs/change-username-email/ChangeEmailDialog";
import { LinkedAccountType, ManualProfileType } from "@/types/account/profile.type";
export default function GeneralSettingsPage() {
	const user = useHttpContextUser();
	 

	const [openDeleteGaddr, setOpenDeleteGaddr] = useState(false);
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
				label: "Manage social media accounts",
				description: "",
				onClick: () => setOpenManageSocial(true),
			},
			{
				label: "Change username",
				description: `@${usernameView || "username"}`,
				onClick: () => setOpenChangeUsername(true),
			},
			{
				label: "Change email",
				description: user?.[ClaimTypes.Email] ?? "user@email.com",
				onClick: () => setOpenChangeEmail(true),
			},
		];

	return (
		<>
			<div className="space-y-8 ">
				{/* Header */}
				<div>
					<h2 className="text-xl font-bold mb-2">General</h2>
					<p className="text-sm text-gray-neutral">Manage your social media connections and account deletion</p>
				</div>

				{/* Profile settings */}
				<section className="space-y-4 ">
					<h3 className="font-semibold text-[20px] mb-2">Profile</h3>

					<div className="space-y-3">
						{profileSettingsItems.map((item) => {
							const content = (
								<>
									<div className="text-left">
										<p className="font-medium">{item.label}</p>
										{item.description ? <p className="text-sm text-gray-500 mt-1">{item.description}</p> : null}
									</div>

									<div>
										<Arrow className="rotate-270 w-4 h-4" />
									</div>
								</>
							);

							const baseClassName = cn(
								"flex w-full items-center justify-between border-b border-[#D9D9D9] p-4 cursor-pointer hover:bg-gray-50 transition"
							);

							if ("onClick" in item) {
								return (
									<button key={item.label} type="button" onClick={item.onClick} className={baseClassName}>
										{content}
									</button>
								);
							}

							return (
								<Link key={item.label} href={item.href} className={baseClassName}>
									{content}
								</Link>
							);
						})}
					</div>
				</section>

				<section className="space-y-4">
					<h3 className="font-semibold text-[20px] mb-4">Delete account</h3>

					{/* --- Delete Gaddr Me & Search Account --- */}
					<div className="flex flex-wrap  justify-between border-b border-[#D9D9D9] p-4 gap-4 lg:grid lg:grid-cols-[2fr_1fr]">
						<div>
							<p className="text-[16px] text-[#BC0E01]">Delete your Gaddr Me & Search Account</p>
							<p className="text-[12px] text-[#BC0E01]">
								You are about to delete your Gaddr Me & Search Account. All your data will be lost.
							</p>
						</div>

						<Button
							type="button"
							label="Delete Gaddr Me & Search Account"
							variant="destructive"
							onClick={() => setOpenDeleteGaddr(true)}
						/>
					</div>

					{/* --- Delete ALL Gaddr Accounts --- */}
					<div className="flex flex-wrap justify-between border-b border-[#D9D9D9] p-4 gap-4 lg:grid lg:grid-cols-[2fr_1fr]">
						<div>
							<p className="text-[16px] text-[#BC0E01]">Delete all your Gaddr Accounts</p>
							<p className="text-[12px] text-[#BC0E01]">
								You are about to delete all your Gaddr accounts and data. All your data will be lost.
							</p>
						</div>

						<Button
							type="button"
							label="Delete all Gaddr Accounts"
							variant="destructive"
							onClick={() => setOpenDeleteAll(true)}
							disabled
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
			/>

			<DeleteGaddrMeSearchAccountDialog open={openDeleteGaddr} onClose={() => setOpenDeleteGaddr(false)} />

			<DeleteAllAccountsDialog open={openDeleteAll} onClose={() => setOpenDeleteAll(false)} />
		</>
	);
}
