"use client";

import * as React from "react";
import { cn } from "@/utils/cn.util";

interface TextareaProps extends React.ComponentProps<"textarea"> {
	label?: string;
	error?: string | boolean;
	helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, label, id, error, helperText, ...props }, ref) => {
		const generatedId = React.useId();
		const textareaId = id ?? generatedId;
		const hasError = typeof error === "string" ? !!error : error;

		return (
			<div className="w-full">
				{label && (
					<label
						htmlFor={textareaId}
						className={cn("block text-sm font-semibold mb-2", hasError && "text-destructive")}
					>
						{label}
					</label>
				)}

				<textarea
					id={textareaId}
					ref={ref}
					data-slot="textarea"
					aria-invalid={hasError ? "true" : undefined}
					className={cn(
						"border-input placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
						className
					)}
					{...props}
				/>

				{hasError && typeof error === "string" ? (
					<p className="text-destructive text-sm mt-1">{error}</p>
				) : helperText ? (
					<p className="text-muted-foreground text-sm mt-1">{helperText}</p>
				) : null}
			</div>
		);
	}
);

Textarea.displayName = "Textarea";

export { Textarea };
