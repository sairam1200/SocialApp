import "./globals.css";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site-config";
import { colorSchemeInitScript } from "@/providers/ColorSchemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getDirection } from "@/i18n/locales";
import { cookies } from "next/headers";
import { AppProviders } from "@/providers";
import { COOKIE_NAMES } from "@/constants/globals";
import { Geist, Geist_Mono } from "next/font/google";
import { ToasterClient } from "./ToasterClient";
import type { CurrentUserResponseType } from "@/types/auth/login.type";
import { Analytics } from "@vercel/analytics/next";

const CURRENT_USER_TIMEOUT_MS = 5000;

async function getCurrentUser(
	accessToken: string,
): Promise<CurrentUserResponseType | null> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), CURRENT_USER_TIMEOUT_MS);
	try {
		const origin = (
			process.env.AUTH_API_URL || "http://localhost:8080"
		).replace(/\/$/, "");
		const response = await fetch(`${origin}/api/v1/auth/current`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			signal: controller.signal,
			cache: "no-store",
		});
		if (!response.ok) return null;
		return (await response.json()) as CurrentUserResponseType;
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

/**
 * Root metadata — inherited by every route, so this is the SEO floor.
 *
 * `metadataBase` matters more than it looks: without it, Next.js cannot resolve
 * relative canonical/OG URLs and silently emits none. `title.template` lets each
 * route set only its own name while still rendering "<Page> · Gaddr".
 *
 * Copy is written to describe what the product does, in plain language. No
 * keyword lists in the description, no superlatives — both read as machine-written
 * and neither helps ranking.
 */
export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: siteConfig.defaultTitle,
		template: `%s ${siteConfig.titleSeparator} ${siteConfig.name}`,
	},
	description: siteConfig.defaultDescription,
	keywords: [...siteConfig.keywords],
	applicationName: siteConfig.name,
	alternates: { canonical: '/' },
	openGraph: {
		type: 'website',
		siteName: siteConfig.name,
		title: siteConfig.defaultTitle,
		description: siteConfig.defaultDescription,
		url: siteConfig.url,
	},
	twitter: {
		card: 'summary_large_image',
		title: siteConfig.defaultTitle,
		description: siteConfig.defaultDescription,
		site: siteConfig.twitterHandle,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
	},
	formatDetection: { telephone: false, address: false, email: false },
};

/**
 * Drives the browser UI colour in both schemes. Declared here rather than as a
 * static meta tag so it tracks the light/dark token values in globals.css.
 */
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
	],
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value ?? null;

	// ponytail: Don't trust JWT decode on server — the backend session check is
	// the authoritative source. Trusting a client-side JWT decode is a spoofing risk.
	const isAuthenticated = !!accessToken;
	const initialUser = accessToken ? await getCurrentUser(accessToken) : null;

	// Resolved by src/i18n/request.ts from the gaddr-locale cookie, then
	// Accept-Language, then DEFAULT_LOCALE ('sv').
	const locale = await getLocale();
	const messages = await getMessages();
	const dir = getDirection(locale);

	return (
		// lang and dir are per-request, not hardcoded. dir="rtl" for Arabic flips
		// layout, scrollbars and logical CSS properties — getting this from the
		// locale registry is what makes RTL work at all.
		<html lang={locale} dir={dir} suppressHydrationWarning>
			<head>
				{/*
				  Applies the stored light/dark preference before first paint.
				  Without this, the server always emits light markup and a dark-mode
				  user sees a white flash on every load. suppressHydrationWarning on
				  <html> is required because this script mutates the class list
				  before React hydrates.
				*/}
				<script
					dangerouslySetInnerHTML={{ __html: colorSchemeInitScript }}
				/>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased text-sm md:text-base xl:text-lg`}>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<AppProviders
						initialUser={initialUser}
						isAuthenticated={isAuthenticated}
					>
						{children}
					</AppProviders>
				</NextIntlClientProvider>
				<ToasterClient />
				<Analytics />
			</body>
		</html>
	);
}
