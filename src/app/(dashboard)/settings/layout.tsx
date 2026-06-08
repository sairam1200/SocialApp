"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn.util";

// Import SVGs as React components
import PersonIcon from "@/components/svg/person.svg";
import SettingsIcon from "@/components/svg/settings-black.svg";
import NotificationsIcon from "@/components/svg/notifications.svg";
import ShieldIcon from "@/components/svg/shield.svg";
import LanguageIcon from "@/components/svg/language.svg";
import HelpIcon from "@/components/svg/help.svg";

const sidebarItems = [
	{ Icon: PersonIcon, label: "Profile", href: "/settings" },
	{ Icon: SettingsIcon, label: "General Settings", href: "/settings/general" },
	{ Icon: NotificationsIcon, label: "Notification Settings", href: "/settings/notifications" },
	{ Icon: ShieldIcon, label: "Security Settings", href: "/settings/security" },
	{ Icon: LanguageIcon, label: "Language", href: "/settings/language" },
	{ Icon: HelpIcon, label: "Help", href: "/settings/help" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
	const [active, setActive] = useState("Profile");

	return (
		<div className="flex gap-10">
			<div className="w-3/12">
				<h1 className="text-xl font-bold mb-2">Account Settings</h1>
				<p className="text-sm text-gray-neutral">
					Manage your connected experiences and account settings in Gaddr technologies.
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
									isActive ? "bg-[#F4D7FF] text-[#C536FF]" : "hover:bg-gray-100 hover:text-[#C536FF]"
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