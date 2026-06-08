import dynamic from "next/dynamic";

// Lazy load the signup form to reduce initial bundle
// This defers loading of formik, yup, turnstile, and other heavy dependencies
const SignupFormClient = dynamic(() => import("./SignupFormClient"), {
	loading: () => (
		<div className="flex items-center justify-center min-h-screen">
			<div className="animate-pulse">
				<div className="h-12 w-64 bg-gray-200 rounded mb-4"></div>
				<div className="h-8 w-48 bg-gray-200 rounded"></div>
			</div>
		</div>
	),
});

export default function SignupPage() {
	return <SignupFormClient />;
}
