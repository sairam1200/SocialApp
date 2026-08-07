"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useColorScheme, type ColorScheme } from "@/providers/ColorSchemeProvider";
import { cn } from "@/utils/cn.util";

/**
 * Light / dark / system switch.
 *
 * Presented as a three-way segmented control rather than a two-state switch,
 * because "system" is a real preference and collapsing it into a binary silently
 * overrides the user's OS setting. Each option is a separate button so it is
 * reachable by keyboard and announced correctly, instead of a div with a click
 * handler.
 */

const OPTIONS: Array<{
	value: ColorScheme;
	label: string;
	Icon: typeof Sun;
}> = [
	{ value: "light", label: "Light", Icon: Sun },
	{ value: "dark", label: "Dark", Icon: Moon },
	{ value: "system", label: "System", Icon: Monitor },
];

export function ColorSchemeToggle({ className }: { className?: string }) {
	const { colorScheme, setColorScheme, isHydrated } = useColorScheme();

	return (
		<div
			role="radiogroup"
			aria-label="Colour scheme"
			className={cn(
				"inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/50 p-0.5",
				className,
			)}
		>
			{OPTIONS.map(({ value, label, Icon }) => {
				// Before hydration the real preference is unknown, so no option is
				// marked selected — showing the wrong one briefly is worse than none.
				const isSelected = isHydrated && colorScheme === value;

				return (
					<button
						key={value}
						type="button"
						role="radio"
						aria-checked={isSelected}
						aria-label={label}
						title={label}
						onClick={() => setColorScheme(value)}
						className={cn(
							"inline-flex size-8 items-center justify-center rounded-full transition-colors",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
							isSelected
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						<Icon className="size-4" aria-hidden="true" />
					</button>
				);
			})}
		</div>
	);
}

/**
 * Single-button variant for dense surfaces such as the mobile header, where a
 * three-way control does not fit. Cycles light → dark → system.
 */
export function ColorSchemeToggleCompact({ className }: { className?: string }) {
	const { colorScheme, resolvedColorScheme, toggleColorScheme, isHydrated } =
		useColorScheme();

	const Icon =
		colorScheme === "system"
			? Monitor
			: resolvedColorScheme === "dark"
				? Moon
				: Sun;

	return (
		<button
			type="button"
			onClick={toggleColorScheme}
			aria-label={`Colour scheme: ${isHydrated ? colorScheme : "loading"}. Activate to change.`}
			title={isHydrated ? `Colour scheme: ${colorScheme}` : "Colour scheme"}
			className={cn(
				"inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors",
				"hover:text-foreground hover:bg-muted",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
				className,
			)}
		>
			{/* Icon is decorative — the button's aria-label carries the state. */}
			<Icon className="size-4" aria-hidden="true" />
		</button>
	);
}
