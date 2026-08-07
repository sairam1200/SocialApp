import AuthFooter from "@/components/layouts/Footer";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";


interface IAuthLayoutProps {
	children: ReactNode;
}

const AuthLayout: React.FC<IAuthLayoutProps> = ({ children }) => {
	return (
		<div className="auth-shell min-h-screen flex flex-col">
			<header className="py-4 pt-5 md:pt-7 max-w-7xl w-full mx-auto flex justify-center lg:justify-start">
				<Link href="/">
					<div className="relative w-[200.5px] h-[30.78px]">
						<Image src="/images/gaddr.svg" alt="gaddr" fill className="object-contain" />
						<div className="absolute inset-0" />
					</div>
				</Link>
			</header>
			<main className="grow container mx-auto py-8">{children}</main>
			
			<AuthFooter />
		</div>
	);
};

export default AuthLayout;
