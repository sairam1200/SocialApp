"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/ui/select";

type Option = { value: string; label: string };

const LANGUAGE_OPTIONS: Option[] = [
    { value: "en", label: "English" },
    { value: "sv", label: "Swedish" },
];

const REGION_OPTIONS: Option[] = [
    { value: "se", label: "Sweden" },
    { value: "us", label: "United States" },
    { value: "gb", label: "United Kingdom" },
    { value: "eu", label: "Europe" },
];

const STORAGE_KEY = "gaddr_language_region";

export default function LanguageSettingsPage() {
    const [language, setLanguage] = useState<string>(LANGUAGE_OPTIONS[0].value);
    const [region, setRegion] = useState<string>(REGION_OPTIONS[0].value);

    // UI only: persist selection locally until API exists
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw) as { language?: string; region?: string };
            if (parsed.language) setLanguage(parsed.language);
            if (parsed.region) setRegion(parsed.region);
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ language, region })
            );
        } catch {
            // ignore
        }
    }, [language, region]);

    const languageSelectOptions = useMemo(
        () => LANGUAGE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
        []
    );

    const regionSelectOptions = useMemo(
        () => REGION_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
        []
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold mb-2">Language</h2>
                <p className="text-sm text-gray-neutral">
                    Manage your language and region preferences
                </p>
            </div>

            <section className="space-y-5 max-w-[360px]">
                <div className="space-y-2">
                    <h3 className="font-semibold text-[20px]">
                        Language <span className="text-[#E61301]">*</span>
                    </h3>

                    <Select
                        value={language}
                        onValueChange={(v) => setLanguage(v)}
                        options={languageSelectOptions}
                        placeholder="Select"
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold text-[20px]">
                        Region <span className="text-[#E61301]">*</span>
                    </h3>

                    <Select
                        value={region}
                        onValueChange={(v) => setRegion(v)}
                        options={regionSelectOptions}
                        placeholder="Select"
                    />
                </div>

                {/* Temporary note until API exists */}
                <p className="text-xs text-[#595959]">
                    UI only: your selection is stored locally. API integration will be added later.
                </p>
            </section>
        </div>
    );
}
