"use client";

import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Button } from "@/components/ui/button";

// ---------- TYPES ----------
export type DialogAction = {
	label: string;
	onClick?: () => void;
	kind?: "primary" | "pill" | "ghost";
	disabled?: boolean;
	loading?: boolean;
	icon?: ReactNode;
	iconSrc?: string;
	iconAlt?: string;
	iconWidth?: number;
	iconHeight?: number;
	iconPosition?: "left" | "right";
};

export type DialogContainerProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children?: ReactNode;
	footer?: ReactNode;
	maxWidthClass?: string;
	actions?: DialogAction[];
	closeOnOverlayClick?: boolean; // default true
	closeOnEsc?: boolean; // default true
};

// ---------- HELPERS ----------
function cx(...classes: (string | false | null | undefined)[]) {
	return classes.filter(Boolean).join(" ");
}
function btnClasses(kind?: "primary" | "pill" | "ghost") {
	switch (kind) {
		case "primary":
			return [
				"bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800",
				"rounded-full h-11 px-6 shadow-[0_2px_6px_rgba(0,0,0,0.06)]",
			].join(" ");
		case "ghost":
			return ["bg-transparent text-purple-600 hover:text-purple-700", "rounded-full h-11 px-4 ring-0 shadow-none"].join(
				" "
			);
		default:
			return [
				"bg-white text-purple-700",
				"rounded-full h-11 px-6",
				"ring-1 ring-black/10",
				"shadow-[inset_0_0_0_2px_rgba(147,51,234,0.16),_0_2px_6px_rgba(0,0,0,0.06)]",
				"hover:bg-purple-50 active:bg-purple-100",
			].join(" ");
	}
}

// ---------- COMPONENT ----------
export default function DialogContainer({
	open,
	onClose,
	title,
	description,
	children,
	footer,
	maxWidthClass = "max-w-2xl",
	actions = [],
	closeOnOverlayClick = true,
	closeOnEsc = true,
}: DialogContainerProps) {
	// Hydration-safe: mount flag
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const lastEscAt = useRef<number>(0);
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") lastEscAt.current = Date.now();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	const handleHeadlessClose = () => {
		const now = Date.now();
		const escRecently = now - lastEscAt.current < 500; // 0.5s window
		if (escRecently) {
			if (closeOnEsc) onClose();
			return;
		}
		if (closeOnOverlayClick) onClose();
	};

	// Early return AFTER hooks are set up
	if (!mounted) return null;

	return (
		<Transition show={open} as={Fragment} appear>
			<Dialog onClose={handleHeadlessClose} className="relative z-50">
				{/* OVERLAY (Headless UI detects outside click for us) */}
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-150"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" />
				</TransitionChild>

				{/* PANEL */}
				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<TransitionChild
							as={Fragment}
							enter="ease-out duration-200"
							enterFrom="opacity-0 scale-95 translate-y-1"
							enterTo="opacity-100 scale-100 translate-y-0"
							leave="ease-in duration-150"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<DialogPanel
								className={cx(
									"w-full",
									maxWidthClass,
									"rounded-2xl bg-white text-zinc-900",
									"ring-1 ring-black/5",
									"shadow-[0_24px_48px_rgba(0,0,0,0.18),0_8px_16px_rgba(0,0,0,0.10)]"
								)}
							>
								{/* HEADER */}
								<div className="px-6 border-b border-[#E0D7FF]">
									<div className="flex items-start justify-between gap-4 py-4">
										<div>
											<DialogTitle className="text-lg font-semibold leading-none">{title}</DialogTitle>
											{description && <p className="text-sm text-zinc-600 mt-2">{description}</p>}
										</div>

										{(closeOnOverlayClick || closeOnEsc) && (
											<button
												onClick={onClose}
												aria-label="Close dialog"
												className="shrink-0 rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
											>
												<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
													<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
												</svg>
											</button>
										)}
									</div>
								</div>

								{/* BODY */}
								<div className="py-5 px-6">{children}</div>

								{/* FOOTER */}

								{footer ? (
									<div className="py-5 px-6">{footer}</div>
								) : actions.length > 0 ? (
									<div className="flex flex-wrap justify-end gap-3 ">
										{actions.map((a, i) => (
											<Button
												key={`${a.label}-${i}`}
												label={a.label}
												type="button"
												onClick={a.onClick}
												disabled={a.disabled || a.loading}
												className={cx(
													"text-sm font-semibold transition p-6",
													"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ",
													"disabled:opacity-50 disabled:cursor-not-allowed",
													btnClasses(a.kind)
												)}
												icon={a.icon}
												iconSrc={a.iconSrc}
												iconAlt={a.iconAlt}
												iconWidth={a.iconWidth}
												iconHeight={a.iconHeight}
												iconPosition={a.iconPosition}
											/>
										))}
									</div>
								) : null}
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}
