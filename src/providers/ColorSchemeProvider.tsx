"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

/**
 * Light / dark / system colour scheme.
 *
 * Distinct from `ThemeProvider`, which selects an *accent colour*
 * (default/blue/teal/purple/sunset) via `data-theme`. The two are orthogonal:
 * a user can run the teal accent in dark mode. Naming them apart avoids the
 * confusion of two providers both called "theme".
 *
 * Mechanism: toggles the `dark` class on <html>, which is what
 * `@custom-variant dark (&:is(.dark *))` and the `.dark` token block in
 * globals.css already key off. Those tokens were fully defined but nothing ever
 * applied the class, so dark mode was unreachable.
 */

export type ColorScheme = "light" | "dark" | "system";
export type ResolvedColorScheme = "light" | "dark";

export const COLOR_SCHEME_STORAGE_KEY = "gaddr-color-scheme";

type ColorSchemeContextValue = {
	/** The user's preference, which may be "system". */
	colorScheme: ColorScheme;
	/** What is actually rendered right now — never "system". */
	resolvedColorScheme: ResolvedColorScheme;
	setColorScheme: (scheme: ColorScheme) => void;
	/** Cycles light → dark → system. */
	toggleColorScheme: () => void;
	/**
	 * False until the client has mounted. Rendering scheme-dependent output before
	 * this is true causes a hydration mismatch, because the server cannot know the
	 * user's preference.
	 */
	isHydrated: boolean;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | undefined>(
	undefined,
);

/**
 * Inline script injected before first paint to prevent a flash of the wrong
 * theme.
 *
 * Without this the server sends light markup, the client reads localStorage after
 * hydration, and a dark-mode user sees a white flash on every navigation — the
 * single most visible defect in a naive dark-mode implementation.
 *
 * Kept dependency-free and synchronous so it executes before the browser paints.
 * Wrapped in try/catch because localStorage throws in Safari private mode.
 */
export const colorSchemeInitScript = `
(function(){try{
var k=${JSON.stringify(COLOR_SCHEME_STORAGE_KEY)};
var s=localStorage.getItem(k);
if(s!=="light"&&s!=="dark"&&s!=="system"){s="system"}
var d=s==="dark"||(s==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var r=document.documentElement;
r.classList.toggle("dark",d);
r.style.colorScheme=d?"dark":"light";
}catch(e){}})();
`.trim();

function systemScheme(): ResolvedColorScheme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function readStoredScheme(): ColorScheme {
	if (typeof window === "undefined") return "system";
	try {
		const stored = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
		if (stored === "light" || stored === "dark" || stored === "system") {
			return stored;
		}
	} catch {
		// localStorage unavailable (Safari private mode) — fall back to system.
	}
	return "system";
}

/** Apply to <html>. `color-scheme` also themes native form controls and scrollbars. */
function applyScheme(resolved: ResolvedColorScheme) {
	const root = document.documentElement;
	root.classList.toggle("dark", resolved === "dark");
	root.style.colorScheme = resolved;
}

export function ColorSchemeProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	// Start at "system" on both server and client so the first client render
	// matches the server markup; the real preference is applied in the effect
	// below. The inline script has already set the correct class on <html>, so
	// there is no visible flash during this window.
	const [colorScheme, setColorSchemeState] = useState<ColorScheme>("system");
	const [resolvedColorScheme, setResolvedColorScheme] =
		useState<ResolvedColorScheme>("light");
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		const stored = readStoredScheme();
		setColorSchemeState(stored);
		setResolvedColorScheme(stored === "system" ? systemScheme() : stored);
		setIsHydrated(true);
	}, []);

	// Follow the OS while the preference is "system".
	useEffect(() => {
		if (colorScheme !== "system") return;

		const query = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => {
			const resolved = query.matches ? "dark" : "light";
			setResolvedColorScheme(resolved);
			applyScheme(resolved);
		};

		query.addEventListener("change", onChange);
		return () => query.removeEventListener("change", onChange);
	}, [colorScheme]);

	const setColorScheme = useCallback((scheme: ColorScheme) => {
		setColorSchemeState(scheme);

		const resolved = scheme === "system" ? systemScheme() : scheme;
		setResolvedColorScheme(resolved);
		applyScheme(resolved);

		try {
			window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
		} catch {
			// Preference simply will not persist; the session still works.
		}
	}, []);

	const toggleColorScheme = useCallback(() => {
		setColorScheme(
			colorScheme === "light"
				? "dark"
				: colorScheme === "dark"
					? "system"
					: "light",
		);
	}, [colorScheme, setColorScheme]);

	const value = useMemo(
		() => ({
			colorScheme,
			resolvedColorScheme,
			setColorScheme,
			toggleColorScheme,
			isHydrated,
		}),
		[
			colorScheme,
			resolvedColorScheme,
			setColorScheme,
			toggleColorScheme,
			isHydrated,
		],
	);

	return (
		<ColorSchemeContext.Provider value={value}>
			{children}
		</ColorSchemeContext.Provider>
	);
}

export function useColorScheme(): ColorSchemeContextValue {
	const context = useContext(ColorSchemeContext);
	if (!context) {
		throw new Error(
			"useColorScheme must be used within a ColorSchemeProvider",
		);
	}
	return context;
}
