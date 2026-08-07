"use client";
import * as React from "react";
import Image from "next/image";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn.util";

export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer active:scale-[0.98] shadow-[0px_2px_3px_0px_#6136FF40]",
	{
		variants: {
			variant: {
				default: "bg-primary text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-[#6400BF]",
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/60 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-4",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary: "bg-white text-primary border-2 border-primary",
				ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
				text: "text-primary bg-transparent border-none shadow-none",
			},
			size: {
				default: "h-9 px-5 py-2 has-[>svg]:px-3",
				sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-full px-6 has-[>svg]:px-4",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
	VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	label?: string;
	loading?: boolean;
	icon?: React.ReactNode;
	iconSrc?: string;
	iconAlt?: string;
	iconWidth?: number;
	iconHeight?: number;
	iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			asChild = false,
			label,
			loading = false,
			disabled,
			icon,
			iconSrc,
			iconAlt = "icon",
			iconWidth = 20,
			iconHeight = 20,
			iconPosition = "left",
			children,
			...props
		},
		ref
	) => {
		const Comp = asChild ? Slot : "button";

		const renderIcon = () => {
			if (loading) {
				return (
					<svg
						className="animate-spin"
						width={iconWidth}
						height={iconHeight}
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				);
			}
			if (iconSrc) {
				return <Image src={iconSrc} alt={iconAlt} width={iconWidth} height={iconHeight} />;
			}
			return icon || null;
		};

		return (
			<Comp
				ref={ref}
				className={cn(buttonVariants({ variant, size, className }))}
				disabled={disabled || loading}
				{...props}
			>
				{asChild ? (
					children
				) : (
					<>
						{iconPosition === "left" && renderIcon()}
						{label || children}
						{iconPosition === "right" && renderIcon()}
					</>
				)}
			</Comp>
		);
	}
);

Button.displayName = "Button";

export { Button };
