import dynamic from "next/dynamic";

// Lazy load the entire client-side login form
// This prevents react-hook-form, zod, and other heavy dependencies from being in the initial bundle
const LoginFormClient = dynamic(() => import("./LoginFormClient"), {
	loading: () => (
		<div className="flex items-center justify-center min-h-screen">
			<div className="animate-pulse">
				<div className="h-12 w-64 bg-muted rounded mb-4"></div>
				<div className="h-8 w-48 bg-muted rounded"></div>
			</div>
		</div>
	),
});

export default function LoginPage() {
	return <LoginFormClient />;
}
