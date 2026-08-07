"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/utils/cn.util";

// Import SVGs as React components
import PersonIcon from "@/components/svg/person.svg";
import SettingsIcon from "@/components/svg/settings-black.svg";
import NotificationsIcon from "@/components/svg/notifications.svg";
import ShieldIcon from "@/components/svg/shield.svg";
import LanguageIcon from "@/components/svg/language.svg";
import HelpIcon from "@/components/svg/help.svg";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
	const [active, setActive] = useState("Profile");
	const t = useTranslations("settings");
	const tNav = useTranslations("nav");

	const sidebarItems = [
		{ Icon: PersonIcon, label: tNav("profile"), href: "/settings" },
		{ Icon: SettingsIcon, label: t("generalSettings"), href: "/settings/general" },
		{ Icon: NotificationsIcon, label: t("notificationSettings"), href: "/settings/notifications" },
		{ Icon: ShieldIcon, label: t("securitySettings"), href: "/settings/security" },
		{ Icon: LanguageIcon, label: t("language"), href: "/settings/language" },
		{ Icon: HelpIcon, label: t("help"), href: "/settings/help" },
	];

	return (
		<div className="flex gap-10">
			<div className="w-3/12">
				<h1 className="text-xl font-bold mb-2">{t("title")}</h1>
				<p className="text-sm text-gray-neutral">
					{t("manageDescription")}
				</p>

				<nav className="space-y-5 mt-5">
					{sidebarItems.map((item) => {
						const IconComponent = item.Icon;
						const isActive = active === item.label;
						return (
							<Link
								key={item.label}
								href={item.href}
								onClick={() => setActive(item.label)}
								className={cn(
									"flex items-center gap-3 rounded-md p-3 text-sm font-medium transition-colors shadow-sm",
									isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted hover:text-accent-foreground"
								)}
							>
								<IconComponent />
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>
			<div className="w-9/12">{children}</div>
		</div>
	);
}