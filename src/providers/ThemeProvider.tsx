"use client";

import { createContext, useContext, useEffect, useState } from "react";

export enum AccentTheme {
	DEFAULT = "default",
	BLUE = "blue",
	TEAL = "teal",
	PURPLE = "purple",
	SUNSET = "sunset",
}

type AccentThemeContextType = {
	theme: AccentTheme;
	setTheme: (theme: AccentTheme) => void;
};

const AccentThemeContext = createContext<AccentThemeContextType | undefined>(undefined);

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<AccentTheme>(AccentTheme.DEFAULT);

	useEffect(() => {
		const stored = localStorage.getItem("accent-theme") as AccentTheme | null;
		const validThemes = Object.values(AccentTheme);

		if (stored && validThemes.includes(stored)) {
			setThemeState(stored);
			document.documentElement.setAttribute("data-theme", stored);
		} else {
			document.documentElement.setAttribute("data-theme", AccentTheme.DEFAULT);
		}
	}, []);

	const setTheme = (theme: AccentTheme) => {
		setThemeState(theme);
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("accent-theme", theme);
	};

	return <AccentThemeContext.Provider value={{ theme, setTheme }}>{children}</AccentThemeContext.Provider>;
}

// Custom hook for accent theme change
export const useAccentTheme = () => {
	const ctx = useContext(AccentThemeContext);
	if (!ctx) throw new Error("useAccentTheme must be used within AccentThemeProvider");
	return ctx;
};
