"use client";

import DialogContainer from "@/components/dialog/DialogContainer";
import { Palette, Sparkles, ImagePlus } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/services/apiClient.service";

type DialogTypes = {
	open: boolean;
	onClose: () => void;
	onCoverPhotoUploaded: (coverPhoto: string | null) => void;
};

const themes = [
	{
		id: "default",
		name: "Default",
		preview: "/images/default-bg.svg",
	},
	{
		id: "landscapes",
		name: "Landscapes",
		preview: "/images/landscape-bg.svg",
	},
	{
		id: "textures",
		name: "Textures",
		preview: "/images/textures-bg.svg",
	},
	{
		id: "nature",
		name: "Nature",
		preview: "/images/nature-bg.svg",
	},
	{
		id: "geometric",
		name: "Geometric shapes",
		preview: "/images/geometric-bg.svg",
	},
	{
		id: "urban",
		name: "Urban",
		preview: "/images/urban-bg.svg",
	},
];

const accentColors = [
	{ id: "purple", color: "#9333ea" },
	{ id: "blue", color: "#3b82f6" },
	{ id: "cyan", color: "#06b6d4" },
	{ id: "magenta", color: "#d946ef" },
	{ id: "coral", color: "#f87171" },
];

const CustomizeGaddrDialog = ({ open, onClose, onCoverPhotoUploaded }: DialogTypes) => {
	const [selectedTheme, setSelectedTheme] = useState("default");
	const [selectedColor, setSelectedColor] = useState("purple");
	const [dragActive, setDragActive] = useState(false);
	const [uploading, setUploading] = useState(false);

	if (!open) return null;

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			void uploadCoverPhoto(e.dataTransfer.files[0]);
		}
	};

	const uploadCoverPhoto = async (file: File) => {
		if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
		setUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);
			await apiClient.User.updateCoverImageAsync(formData);
			onCoverPhotoUploaded(URL.createObjectURL(file));
		} finally {
			setUploading(false);
		}
	};

	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title="Customizing my Gaddr"
			description=""
			closeOnOverlayClick={true}
			closeOnEsc={true}
			footer
			actions={[{ label: "Cancel" }, { label: "Save" }]}
		>
			<div className="space-y-4">
				{/* Update Background */}
				<div>
					<div className="flex items-center gap-2 mb-4">
						<ImagePlus />
						<h3 className="text-base font-bold">Update Background</h3>
					</div>

					<div
						className={`border border-dashed rounded-xl text-center transition-colors p-5 cursor-pointer bg-[#F2F3F5] ${
							dragActive ? "border-primary" : "border-[#E5E6EB]"
						}`}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}
					>
						<input
							type="file"
							accept="image/jpeg,image/png,image/gif,image/webp"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) void uploadCoverPhoto(file);
							}}
							className="sr-only"
							id="cover-photo-upload"
						/>
						<label htmlFor="cover-photo-upload" className="block cursor-pointer">
						<div className="flex flex-col items-center justify-center">
							<span className="text-2xl text-[#4E5969]">+</span>
							<p className="text-sm font-medium">{uploading ? "Uploading..." : "Drag or choose a picture"}</p>
							<p className="text-sm text-[#86909C]">PNG, JPG, GIF, or WEBP up to 5MB</p>
						</div>
						</label>
					</div>
				</div>

				{/* Change Theme */}
				<div className="">
					<div className="flex items-center gap-2 mb-4">
						<Sparkles />
						<h3 className="text-base font-bold">Change theme</h3>
					</div>

					<div>
						<div className="grid grid-cols-3 gap-4">
							{themes.map((theme) => (
								<button
									key={theme.id}
									onClick={() => setSelectedTheme(theme.id)}
									className={`relative overflow-hidden transition-all cursor-pointer`}
								>
									<div className="bg-gray-100 p-2 pb-2 rounded-lg">
										<div className="flex gap-1 mb-2">
											<div className="w-2 h-2 rounded-full bg-[#F64028]"></div>
											<div className="w-2 h-2 rounded-full bg-[#FFD527]"></div>
											<div className="w-2 h-2 rounded-full bg-[#7BD40B]"></div>
										</div>
										<div
											className="w-full h-20 rounded-lg relative"
											style={{
												backgroundImage: `url(${theme.preview})`,
												backgroundSize: "cover",
												backgroundPosition: "center",
											}}
										>
											<div
												className="absolute bottom-[-12] left-3 w-8 h-8 rounded-full bg-white"
												style={{
													boxShadow: "0px 8px 12px -8px #00000066",
													// boxShadow: "0px 0px 3.97px 0px #F8F8F840 inset",
													backdropFilter: "blur(5.952304840087891px)",
												}}
											></div>
										</div>

										<div className="flex items-end gap-2 pt-2">
											<div className="h-1.5 customize-bar-gradient rounded w-3/12 ml-2"></div>

											<div className="w-9/12 flex flex-col gap-1">
												<div className="flex justify-between w-full">
													<div className="h-1 customize-bar-gradient rounded w-5/12"></div>
													<div className="h-1 customize-bar-gradient rounded w-1/12"></div>
												</div>
												<div className="h-2 customize-bar-gradient rounded"></div>
												<div className="h-1 customize-bar-gradient rounded"></div>
											</div>
										</div>
									</div>
									<div className="flex justify-center">
										<div
											className={`py-2 px-3 text-sm text-center border-b-2 border-transparent w-fit ${
												selectedTheme === theme.id
													? "gradient-text-primary gradient-border-primary font-bold"
													: "text-[#241357] font-medium"
											}`}
										>
											{theme.name}
										</div>
									</div>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Accent Color */}
				<div>
					<div className="flex items-center gap-2 mb-4">
						<Palette size={20} className="text-gray-700" />
						<h3 className="text-lg font-semibold text-gray-900">Accent color</h3>
					</div>

					<div className="flex gap-4">
						{accentColors.map((color) => (
							<button
								key={color.id}
								onClick={() => setSelectedColor(color.id)}
								className={`relative w-12 h-12 rounded-full transition-all ${
									selectedColor === color.id ? "ring-2 ring-offset-2 ring-gray-400" : "hover:scale-110"
								}`}
								style={{ backgroundColor: color.color }}
							>
								{selectedColor === color.id && (
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-3 h-3 bg-white rounded-full"></div>
									</div>
								)}
							</button>
						))}
					</div>
				</div>
			</div>
		</DialogContainer>
	);
};

export default CustomizeGaddrDialog;
