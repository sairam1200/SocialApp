import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { AppProviders } from "@/providers";
import { COOKIE_NAMES } from "@/constants/globals";
import { Geist, Geist_Mono } from "next/font/google";
import { JwtPayload } from "@/types/jwtPayload.type";
import { ToasterClient } from "./ToasterClient";
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Gaddr",
	description: "Gaddr",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value ?? null;

	let jwtUser: JwtPayload | null = null;
	if (accessToken) {
		try {
			const payload = jwtDecode<JwtPayload>(accessToken);
			const now = Math.floor(Date.now() / 1000);

			if (payload.exp) {
				if (payload.exp > now) {
					jwtUser = payload;
				}
			} else {
				jwtUser = payload;
			}
		} catch {
			jwtUser = null;
		}
	}

	const isAuthenticated = !!jwtUser && !!accessToken;
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<AppProviders jwtUser={jwtUser} accessToken={accessToken} isAuthenticated={isAuthenticated}>
					{children}
				</AppProviders>
				<ToasterClient />
			</body>
		</html>
	);
}