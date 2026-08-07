"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import {
	AVAILABLE_LOCALES,
	LOCALES,
	getLocale as getLocaleDefinition,
} from "@/i18n/locales";
import { setLocalePreference } from "./actions";

/**
 * Language and region preferences.
 *
 * Previously a UI-only stub: it wrote the choice to localStorage and nothing read
 * it, so changing the language had no effect at all. It now writes the
 * `gaddr-locale` cookie through a server action, which src/i18n/request.ts reads
 * to select the message catalog — so the selection genuinely changes the UI
 * language.
 *
 * The picker offers only locales with a reviewed catalog (AVAILABLE_LOCALES).
 * Remaining target languages are listed as "coming next" rather than hidden, so
 * the roadmap is visible without offering a language that would silently render
 * English.
 */

const REGION_OPTIONS = [
	{ value: "SE", label: "Sweden" },
	{ value: "NO", label: "Norway" },
	{ value: "DK", label: "Denmark" },
	{ value: "FI", label: "Finland" },
	{ value: "GB", label: "United Kingdom" },
	{ value: "US", label: "United States" },
	{ value: "AE", label: "United Arab Emirates" },
	{ value: "BE", label: "Belgium" },
];

const REGION_STORAGE_KEY = "gaddr_region";

export default function LanguageSettingsPage() {
	const t = useTranslations("settings.languageSection");
	const activeLocale = useLocale();
	const [isPending, startTransition] = useTransition();

	const [region, setRegion] = useState<string>(() => {
		const fallback = getLocaleDefinition(activeLocale)?.defaultRegion ?? "SE";

		if (typeof window === "undefined") return fallback;
		try {
			return window.localStorage.getItem(REGION_STORAGE_KEY) ?? fallback;
		} catch {
			return fallback;
		}
	});

	// Endonyms: a language picker should show each language the way its own
	// speakers write it, not translated into the current UI language.
	const languageOptions = useMemo(
		() =>
			AVAILABLE_LOCALES.map((locale) => ({
				value: locale.code,
				label:
					locale.nativeName === locale.englishName
						? locale.nativeName
						: `${locale.nativeName} (${locale.englishName})`,
			})),
		[],
	);

	const plannedLocales = useMemo(
		() => LOCALES.filter((locale) => !locale.hasCatalog),
		[],
	);

	function onLanguageChange(next: string) {
		// The server action sets the cookie and revalidates, so the new catalog
		// applies on the resulting render rather than after a manual reload.
		startTransition(() => {
			void setLocalePreference(next);
		});
	}

	function onRegionChange(next: string) {
		setRegion(next);
		try {
			window.localStorage.setItem(REGION_STORAGE_KEY, next);
		} catch {
			// Preference simply will not persist; the session still works.
		}
	}

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-xl font-bold mb-2">{t("title")}</h2>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>

			<section className="space-y-5 max-w-[360px]">
				<div className="space-y-2">
					<h3 className="font-semibold text-[20px]">{t("label")}</h3>

					<Select
						value={activeLocale}
						onValueChange={onLanguageChange}
						options={languageOptions}
						placeholder={t("label")}
					/>

					{isPending ? (
						<p
							className="text-xs text-muted-foreground"
							role="status"
							aria-live="polite"
						>
							{t("saved")}
						</p>
					) : null}
				</div>

				<div className="space-y-2">
					<h3 className="font-semibold text-[20px]">{t("region")}</h3>

					<Select
						value={region}
						onValueChange={onRegionChange}
						options={REGION_OPTIONS}
						placeholder={t("region")}
					/>

					<p className="text-xs text-muted-foreground">{t("regionHint")}</p>
				</div>
			</section>

			{/* Roadmap, shown rather than hidden: offering a language with no catalog
			    would render English while claiming to be translated. */}
			{plannedLocales.length > 0 ? (
				<section className="space-y-2 max-w-[540px]">
					<h3 className="font-semibold text-base">Coming next</h3>
					<p className="text-xs text-muted-foreground">{t("notTranslated")}</p>
					<ul className="flex flex-wrap gap-1.5">
						{plannedLocales.map((locale) => (
							<li
								key={locale.code}
								className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
								lang={locale.code}
								dir={locale.dir}
							>
								{locale.nativeName}
							</li>
						))}
					</ul>
				</section>
			) : null}
		</div>
	);
}
