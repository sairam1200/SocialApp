// src/app/(dashboard)/layout.tsx

import SidebarNav from "@/components/navigation/SideBarNav";
import Footer from "@/components/layouts/Footer";
import SearchBar from "@/components/layouts/search-bar";
import { BookmarkProvider } from "@/contexts/BookmarkContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
		<BookmarkProvider>
			<div className="flex flex-col min-h-screen overflow-hidden">
				<div className="flex flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 xl:px-8 pt-6 bg-white">
					<SidebarNav />

					<main className="flex-1 min-w-0">
						<SearchBar />
						{children}
					</main>
				</div>

				<Footer />
			</div>
		</BookmarkProvider>
	);
}