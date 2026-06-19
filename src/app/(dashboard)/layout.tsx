// src/app/(dashboard)/layout.tsx


import SidebarNav from "@/components/navigation/SideBarNav";
import Footer from "@/components/layouts/Footer";
import SearchBar from "@/components/layouts/search-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
		<div className="flex flex-col min-h-screen overflow-hidden">
			<div className="flex flex-1 p-5 bg-white max-w-7xl w-full mx-auto">
				<SidebarNav />

				<main className="flex-1 min-w-0">
					<SearchBar />
					{children}
				</main>
			</div>

			<Footer />
		</div>
	);
}