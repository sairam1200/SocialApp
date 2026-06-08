// src/app/(dashboard)/settings/profile/components/AddSocialLinkFlow.tsx
"use client";

import { SVGProps, useMemo, useState } from "react";
import type { Platform } from "@/constants/platforms";

export type LinkedAccount = {
	platformId: string;
	username: string;
	connectionMethod: "link" | "sync";
};

type FlowProps = {
	open: boolean;
	onOpen: () => void;
	onClose: () => void;
	platformsState: Platform[];
	setPlatformsState: React.Dispatch<React.SetStateAction<Platform[]>>;
	onLinkedAdded: (acc: { platformId: string; username: string }) => void;
	onLinkedRemoved?: (platformId: string, username?: string) => void; // <- valfri, för att synka profil-listan
};

export default function AddSocialLinkFlow({
	open,
	onOpen,
	onClose,
	platformsState,
	setPlatformsState,
	onLinkedAdded,
	onLinkedRemoved,
}: FlowProps) {
	const [step, setStep] = useState<"manage" | "link">("manage");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [username, setUsername] = useState("");

	const connected = useMemo(() => platformsState.filter((p) => !!p.connected), [platformsState]);
	const available = useMemo(() => platformsState.filter((p) => !p.connected), [platformsState]);

	const selectedPlatform = (selectedId && platformsState.find((p) => p.id === selectedId)) || null;

	// ---------------------
	// Disconnect handler
	// ---------------------
	function handleDisconnect(platformId: string) {
		setPlatformsState((prev) => {
			const idx = prev.findIndex((p) => p.id === platformId);
			if (idx === -1) return prev;

			const old = prev[idx];
			const username = old.handle;

			const updated: Platform = {
				...old,
				connected: false,
				connectionMethod: undefined,
				handle: undefined,
				verified: false,
				metrics: undefined,
			};

			const rest = prev.filter((_, i) => i !== idx);
			const next = [updated, ...rest];

			if (onLinkedRemoved) {
				onLinkedRemoved(platformId, typeof username === "string" ? username : undefined);
			}

			return next;
		});

		setStep("manage");
		onOpen();
	}

	// ---------------------
	// Save link (manual)
	// ---------------------
	function handleSaveLink() {
		if (!selectedPlatform) return;
		const clean = username.trim().replace(/^@/, "");
		if (!clean) return;

		setPlatformsState((prev) =>
			prev.map((p) =>
				p.id === selectedPlatform.id ? { ...p, connected: true, connectionMethod: "link", handle: clean } : p
			)
		);

		onLinkedAdded({ platformId: selectedPlatform.id, username: clean });

		// Reset
		setUsername("");
		setSelectedId(null);
		setStep("manage");
		onClose();
	}

	if (!open) return null;

	// ========================
	// MANAGE VIEW (Connected + Available)
	// ========================
	if (step === "manage") {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center">
				<div className="absolute inset-0 bg-black/30" onClick={onClose} />
				<div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold">Add a new social link</h2>
						<button onClick={onClose} className="text-zinc-500 hover:text-zinc-700" aria-label="Close">
							✕
						</button>
					</div>
					<div className="mb-5">
						<div className="text-sm font-semibold text-zinc-800 mb-2">Connected</div>
						{connected.length === 0 ? (
							<div className="text-sm text-zinc-500">No connected platforms.</div>
						) : (
							<div className="flex flex-col gap-2">
								{connected.map((p) => {
									const Icon = p.icon as React.ComponentType<SVGProps<SVGSVGElement>>;
									return (
										<div
											key={`conn-${p.id}`}
											className="flex items-center justify-between rounded-xl border border-zinc-200 bg-[#FAFAFA] px-4 py-3"
										>
											<div className="flex items-center gap-3">
												<Icon width={20} height={20} />
												<div className="flex flex-col">
													<span className="text-sm font-medium">{p.name}</span>
													{p.handle && <span className="text-xs text-zinc-500">@{p.handle}</span>}
												</div>
											</div>
											<button
												type="button"
												onClick={() => handleDisconnect(p.id)}
												className="h-8 px-3 rounded-full border border-[#FFD1D1] bg-white text-[#FF4D4F] text-xs font-medium hover:bg-[#FFF3F4] transition"
											>
												Disconnect
											</button>
										</div>
									);
								})}
							</div>
						)}
					</div>
					<div>
						<div className="text-sm font-semibold text-zinc-800 mb-2">Available platforms</div>
						{available.length === 0 ? (
							<div className="text-sm text-zinc-500">All platforms are already connected.</div>
						) : (
							<div className="flex flex-col gap-2">
								{available.map((p) => {
									const Icon = p.icon as React.ComponentType<SVGProps<SVGSVGElement>>;
									return (
										<button
											key={`avail-${p.id}`}
											onClick={() => {
												setSelectedId(p.id);
												setStep("link");
											}}
											className="w-full flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50"
										>
											<div className="flex items-center gap-3">
												<Icon width={20} height={20} />
												<span className="text-sm font-medium">{p.name}</span>
											</div>
											<span className="text-xs text-zinc-500">Link manually</span>
										</button>
									);
								})}
							</div>
						)}
					</div>

					<div className="mt-6 flex justify-end">
						<button onClick={onClose} className="h-10 px-4 rounded-full border border-zinc-200">
							Close
						</button>
					</div>
				</div>
			</div>
		);
	}

	// ========================
	// LINK VIEW (username input)
	// ========================
	if (step === "link" && selectedPlatform) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center">
				<div
					className="absolute inset-0 bg-black/30"
					onClick={() => {
						setStep("manage");
						onOpen();
					}}
				/>
				<div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold">Link {selectedPlatform.name}</h2>
						<button
							onClick={() => {
								setStep("manage");
								onOpen();
							}}
							className="text-zinc-500 hover:text-zinc-700"
							aria-label="Close"
						>
							✕
						</button>
					</div>

					<label className="block text-sm font-medium mb-1">Username / Handle</label>
					<input
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="@your_handle"
						className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
					/>

					<div className="mt-6 flex justify-end gap-3">
						<button
							onClick={() => {
								setStep("manage");
								onOpen();
							}}
							className="h-10 px-4 rounded-full border border-zinc-200"
						>
							Back
						</button>
						<button onClick={handleSaveLink} className="h-10 px-5 rounded-full bg-purple-600 text-white font-semibold">
							Save
						</button>
					</div>
				</div>
			</div>
		);
	}

	return null;
}
