import SidebarNav from "@/components/navigation/SideBarNav";
import Footer from "@/components/layouts/Footer";
import SearchBar from "@/components/layouts/search-bar";
import { BookmarkProvider } from "@/contexts/BookmarkContext";

/**
 * The dashboard shell.
 *
 * The content column used to be `bg-white`, which is invisible in dark mode —
 * the exact trap `AGENTS.md` names. It went unnoticed for as long as every
 * child painted its own background: search results and cards each carry
 * `bg-card`, so the white container was never the thing you actually saw.
 *
 * Community's right rail has no background of its own, so it inherited the
 * white and rendered near-white text on white. `bg-background` follows the
 * colour scheme, and any future child that does not paint itself is safe.
 */
export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<BookmarkProvider>
			<div className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
				<div className="mx-auto flex w-full max-w-[1440px] flex-1 bg-background px-4 pt-6 md:px-6 xl:px-8">
					<SidebarNav />

					<main className="min-w-0 flex-1">
						<SearchBar />
						{children}
					</main>
				</div>

				<Footer />
			</div>
		</BookmarkProvider>
	);
}
