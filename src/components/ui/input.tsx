"use client";

import * as React from "react";
import { cn } from "@/utils/cn.util";
import WarningIcon from "@/components/svg/warning-icon.svg";

// --- types ---
export type ErrorVariant = "text" | "boxed" | "none";

// boxed - with border/background/icon
export type BoxedError = {
	title: string;
	description?: string;
	icon?: React.ReactNode;
};

export type InputError = string | boolean | BoxedError;

interface InputProps extends React.ComponentProps<"input"> {
	label?: string;

	/**
	 * error:
	 * - false/undefined: no error
	 * - string: simple error text
	 * - {title, description}: boxed error (or can be used with variant="text" too)
	 */
	error?: InputError;
	helperText?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;

	/** how to render error */
	errorVariant?: ErrorVariant; // default "text"

	/** wrapper class for the error block */
	errorClassName?: string;

	/** override error rendering completely */
	errorSlot?: React.ReactNode;
}

// --- default icon for boxed error ---
function DefaultAlertIcon() {
	return <WarningIcon className="h-3 w-3" aria-hidden="true" />;
}

function isBoxedError(error: InputError | undefined): error is BoxedError {
	return typeof error === "object" && error !== null && "title" in error;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			type = "text",
			label,
			id,
			error,
			helperText,
			leftIcon,
			rightIcon,
			errorVariant = "text",
			errorClassName,
			errorSlot,
			...props
		},
		ref
	) => {
		const generatedId = React.useId();
		const inputId = id ?? generatedId;

		const hasError = typeof error === "string" ? error.length > 0 : isBoxedError(error) ? true : Boolean(error);

		const errorString = typeof error === "string" ? error : null;
		const errorObj = isBoxedError(error) ? error : null;

		const errorNode = (() => {
			if (!hasError || errorVariant === "none") return null;

			// full custom
			if (errorSlot) return <div className={cn("mt-2", errorClassName)}>{errorSlot}</div>;

			// boxed style (like your screenshot)
			if (errorVariant === "boxed") {
				const title = errorObj?.title ?? errorString ?? "Error";
				const description = errorObj?.description;
				const icon = errorObj?.icon ?? <DefaultAlertIcon />;

				return (
					<div
						className={cn(
							"mt-2 flex gap-2 rounded-lg border border-[#D23F3F] bg-[#FCEEEE] px-3 py-2 text-[#B42318]",
							errorClassName
						)}
					>
						<div className="mt-0.5 shrink-0">{icon}</div>

						{/* title 1 line, desc smaller (as on mock) */}
						<div className="min-w-0">
							<div className="text-sm font-medium leading-5">{title}</div>
							{description ? <div className="text-xs mt-1 leading-4 text-[#B42318]/80">{description}</div> : null}
						</div>
					</div>
				);
			}

			// default: text line
			const text = errorObj?.title ?? errorString;
			if (!text) return null;

			return <p className={cn("text-destructive text-sm mt-1", errorClassName)}>{text}</p>;
		})();

		return (
			<>
				{label && (
					<label htmlFor={inputId} className={cn("block text-sm font-semibold mb-2", hasError && "text-destructive")}>
						{label}
					</label>
				)}

				<div className="relative w-full">
					{leftIcon && (
						<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
							{leftIcon}
						</span>
					)}
					<input
						id={inputId}
						ref={ref}
						type={type}
						data-slot="input"
						aria-invalid={hasError ? "true" : undefined}
						className={cn(
							"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-5 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
							"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
							leftIcon ? "pl-10" : "",
							rightIcon ? "pr-10" : "",
							className
						)}
						{...props}
					/>
					{rightIcon && (
						<span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{rightIcon}</span>
					)}
				</div>

				{errorNode ? (
					errorNode
				) : !hasError && helperText ? (
					<p className="text-muted-foreground text-sm mt-1">{helperText}</p>
				) : null}
			</>
		);
	}
);

Input.displayName = "Input";
export { Input };
