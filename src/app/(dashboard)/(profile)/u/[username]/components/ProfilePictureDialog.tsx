"use client";

import { useState, useRef, DragEvent, useEffect } from "react";
import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";
import { ArrowUp, Trash2 } from "lucide-react";
import Image from "next/image";
import GlobeIcon from "@/components/svg/language.svg";
import PeopleIcon from "@/components/svg/person-double.svg";
import { ImageCrop, ImageCropApply, ImageCropContent, ImageCropReset } from "@/components/ui/shadcn-io/image-crop";
import { UserPhotoPrivacy, UserProfileType } from "@/types/account/profile.type";
import { apiClient } from "@/services/apiClient.service";
import { toast } from "react-hot-toast";

type DialogTypes = {
	open: boolean;
	onClose: () => void;
	user: UserProfileType | undefined;
};

const privacyOptions = [
	{
		value: "Everyone" as UserPhotoPrivacy,
		icon: GlobeIcon,
		title: "Everyone",
		description: "Anyone who has your contact details will be able to see this information.",
	},
	{
		value: "Interactions" as UserPhotoPrivacy,
		icon: PeopleIcon,
		title: "People you interact with",
		description: "This information is visible to people you interact with on the Gaddr Services.",
	},
];

const ProfilePictureDialog = ({ open, onClose, user }: DialogTypes) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [croppedImage, setCroppedImage] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedPrivacy, setSelectedPrivacy] = useState<UserPhotoPrivacy>(
		user?.photoPrivacy ?? "Everyone"
	);

	const [loadingPrivacy, setLoadingPrivacy] =
		useState<UserPhotoPrivacy | null>(null);
	// Handle dropped file
	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith("image/")) {
			setSelectedFile(file);
			setCroppedImage(null);
		}
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setIsDragging(false);
		}
	};
	useEffect(() => {
		if (user?.photoPrivacy) {
			setSelectedPrivacy(user.photoPrivacy);
		}
	}, [user]);
	// Handle file selection from computer
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && file.type.startsWith("image/")) {
			setSelectedFile(file);
			setCroppedImage(null);
		}
	};

	const handleUploadClick = () => fileInputRef.current?.click();

	const handleReset = () => {
		setSelectedFile(null);
		setCroppedImage(null);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleRemoveImage = () => {
		setSelectedFile(null);
		setCroppedImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	/** Upload cropped image */
	const handleSaveImage = async () => {
		if (!croppedImage) return;

		setIsUploadingImage(true);

		try {
			const imgRes = await fetch(croppedImage);
			const blob = await imgRes.blob();

			const formData = new FormData();
			formData.append("file", blob, "profile.jpg");

			console.log("FORM DATA FILE", formData.get("file"));

			const uploadResponse = await fetch(
				"https://socialapp-backend-4sdw.onrender.com/api/v1/account/profile-image",
				{
					method: "PATCH",
					body: formData,
					credentials: "include",
				}
			);

			console.log("STATUS", uploadResponse.status);

			if (uploadResponse.ok) {
				toast.success("Profile Image Updated successfully");
				setSelectedFile(null);
				setCroppedImage(null);
				onClose();
			} else {
				toast.error("Upload failed");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to upload image");
		} finally {
			setIsUploadingImage(false);
		}
	};

	/** Update privacy */
	const handleUpdatePrivacy = async (value: UserPhotoPrivacy) => {
		setSelectedPrivacy(value);
		setLoadingPrivacy(value);
		setIsUpdatingPrivacy(true);

		try {
			const result = await apiClient.User.updateProfileImagePrivacyAsync({
				privacy: value,
			});
			console.log("UPLOAD RESULT", result);

			if (result.success) {
				toast.success("Profile Image Privacy Updated successfully");
			} else {
				toast.error(result.error ?? "Failed to update privacy");

				if (user?.photoPrivacy) {
					setSelectedPrivacy(user.photoPrivacy);
				}
			}
		} catch {
			toast.error("Failed to update privacy");

			if (user?.photoPrivacy) {
				setSelectedPrivacy(user.photoPrivacy);
			}
		} finally {
			setIsUpdatingPrivacy(false);
			setLoadingPrivacy(null);
		}
	};
	return (
		<DialogContainer
			open={open}
			onClose={onClose}
			title="Change Profile Photo"
			description=""
			closeOnOverlayClick={!selectedFile || !!croppedImage}
			closeOnEsc={!selectedFile || !!croppedImage}
		>
			<div className="space-y-4">
				{selectedFile && !croppedImage ? (
					// Image Crop View
					<div className="space-y-4">
						<ImageCrop file={selectedFile} aspect={1} circularCrop maxImageSize={1024 * 1024} onCrop={setCroppedImage}>
							<div className="flex flex-col items-center w-full">
								<ImageCropContent className="max-h-[400px]" />
								<div className="flex gap-3 justify-center mt-4 w-full">
									<ImageCropReset asChild>
										<Button onClick={handleReset} variant="outline" className="w-1/2">
											Cancel
										</Button>
									</ImageCropReset>
									<ImageCropApply asChild>
										<Button className="gradient-bg-primary w-1/2">Apply Crop</Button>
									</ImageCropApply>
								</div>
							</div>
						</ImageCrop>
					</div>
				) : (
					<>
						{/* Avatar Drop Zone */}
						<div
							onDrop={handleDrop}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							className={`flex flex-col items-center bg-[#FAFAFA] border py-5 rounded-md transition-all duration-200 ${isDragging ? "border-primary border-dashed" : "border-[#E6E6E6]"
								}`}
						>
							<div className="relative">
								<div
									className={`relative w-[72px] h-[72px] rounded-full flex justify-center items-center overflow-hidden ${isDragging
										? "border border-dashed border-primary bg-secondary/30"
										: "bg-secondary"
										}`}
								>
									{croppedImage ? (
										<Image
											src={croppedImage}
											alt="Preview"
											fill
											sizes="72px"
											className="object-cover rounded-full"
											unoptimized
										/>
									) : (
										<div className="relative w-[72px] h-[72px]">
											<Image
												key={user?.photo}
												src={user?.photo || "/images/avatar-placeholder.svg"}
												alt="avatar"
												className="w-full h-full object-cover rounded-full"
											/>
										</div>
									)}
								</div>
								{croppedImage && (
									<button
										onClick={handleRemoveImage}
										className="w-6 h-6 rounded-full flex items-center justify-center bg-[#F64028] absolute bottom-1 right-[-2] z-10 cursor-pointer hover:bg-[#D63620] transition-colors"
									>
										<Trash2 className="w-3 h-3 text-white" />
									</button>
								)}
							</div>
							<p className="text-sm font-semibold pt-2">Drag the photo here</p>
						</div>

						<p className="text-gray-neutral text-center">or</p>

						{/* Action Buttons */}
						<div className="flex flex-row gap-3 justify-center w-full">
							<Button onClick={handleUploadClick} className="bg-white text-primary border-2 border-primary w-1/2 py-5">
								<ArrowUp /> Upload from computer
							</Button>

							<input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

							<Button className="bg-secondary border-2 border-primary w-1/2 py-5">
								<Image src="/icons/gaddr-logo-xs.svg" height={24} width={24} alt="Gaddr Logo" />
								<p className="gradient-text-primary">Gaddr Photos</p>
							</Button>
						</div>

						{/* Privacy Settings */}
						<div className="mt-8 space-y-4">
							<h4 className="font-semibold text-sm">Who can see your profile picture</h4>

							<div className="space-y-3">
								{privacyOptions.map((opt) => {
									const Icon = opt.icon;
									return (
										<label key={opt.value} className="flex items-start gap-3 cursor-pointer">
											<input
												type="radio"
												name="visibility"
												checked={selectedPrivacy === opt.value}
												onChange={() => handleUpdatePrivacy(opt.value)}
												disabled={isUpdatingPrivacy}
												className="gradient-radio mt-1"
											/>
											<div className="flex-1">
												<div className="flex items-center gap-2 font-medium">
													<Icon className="scale-75" />
													{opt.title}
												</div>
												<p className="text-xs text-gray-600 mt-1">{opt.description}</p>
											</div>
											{isUpdatingPrivacy &&
												loadingPrivacy === opt.value && (
													<span className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full" />
												)}
										</label>
									);
								})}
							</div>
						</div>
					</>
				)}

				{croppedImage && (
					<div className="w-full flex justify-end mt-5">
						<Button onClick={handleSaveImage} disabled={isUploadingImage} className="gradient-bg-primary">
							{isUploadingImage ? "Uploading..." : "Done"}
						</Button>
					</div>
				)}
			</div>
		</DialogContainer>
	);
};

export default ProfilePictureDialog;
