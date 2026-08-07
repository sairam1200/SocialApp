"use client";

import * as React from "react";
import { cn } from "@/utils/cn.util";

interface CheckboxProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	icon?: React.ReactNode;
}

export const Checkbox = React.memo(
	React.forwardRef<HTMLInputElement, CheckboxProps>(
		({ className, label, icon, checked, id, ...props }, ref) => {

			const generatedId = React.useId();
			const inputId = id || generatedId;

			return (
				<label
					htmlFor={inputId}
					className={cn(
						"flex items-center justify-between w-full p-4 rounded-lg border cursor-pointer transition-colors",
						checked
							? "border-primary bg-primary/15"
							: "border-border hover:bg-accent",
						className
					)}
				>
					<div className="flex flex-col gap-1 select-none">
						{icon && <span className="text-xl">{icon}</span>}
						{label && (
							<span className="text-xs font-bold text-foreground">
								{label}
							</span>
						)}
					</div>

					<div
						className={cn(
							"w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
							checked
								? "bg-indigo-600 border-indigo-600"
								: "border-indigo-200"
						)}
					>
						{checked && (
							<div className="w-2 h-2 rounded-full bg-white" />
						)}
					</div>

					<input
						ref={ref}
						id={inputId}
						type="checkbox"
						checked={checked}
						className="sr-only"
						{...props}
					/>
				</label>
			);
		}
	)
);

Checkbox.displayName = "Checkbox";
