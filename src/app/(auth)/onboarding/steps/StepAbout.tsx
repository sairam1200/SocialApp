"use client";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { User, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProfileFormData } from "./types";

interface StepOneAboutProps {
    formData: ProfileFormData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onNext: () => void;
}

export function StepOneAbout({
    formData,
    handleChange,
    handleImageChange,
    onNext,
}: StepOneAboutProps) {
    const canProceed =
    (formData.fullName ?? "").trim().length > 0 &&
    (formData.bio ?? "").trim().length > 0;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-[10px] w-full mx-auto border border-indigo-100/50 shadow-lg ring-1 ring-black/5 h-[750px]">
            <div className="my-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Tell us about yourself
                </h2>

                <p className="text-sm font-medium text-gray-600 mb-8">
                    Welcome! Let&apos;s get to know you better to personalize your experience.
                </p>
            </div>

            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center mb-4">
                    {formData.profileImagePreview ? (
                        <Image
                            src={formData.profileImagePreview}
                            alt="Profile preview"
                            width={80}
                            height={80}
                            unoptimized
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-8 h-8 text-gray-400" />
                    )}
                </div>

                <input
                    id="profile-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                />

                <Button
                    type="button"
                    onClick={() =>
                        document.getElementById("profile-upload")?.click()
                    }
                    icon={<Upload className="w-4 h-4" />}
                    className="bg-[#6e08b8] hover:bg-[#aa2fff]/90 text-white"
                >
                    {formData.profileImage ? "Change image" : "Upload image"}
                </Button>

                <p className="text-[12px] text-gray-500 mt-2">
                    JPG, PNG, WEBP up to 5MB or (OPTIONAL)
                </p>
            </div>

            {/* Username */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Choose a username <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                            <User className="h-5 w-5 text-gray-400" />
                        </span>

                        <Input
                            type="text"
                            name="fullName"
                            value={formData.fullName ?? ""}
                            onChange={handleChange}
                            placeholder="Enter username"
                            className="w-full pl-10 pr-4 py-6 bg-white border-gray-300 rounded-xl"
                        />
                    </div>
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Write a short bio
                    </label>

                    <textarea
                        name="bio"
                        value={formData.bio ?? ""}
                        onChange={handleChange}
                        rows={4}
                        placeholder="I'm a designer who enjoys traveling..."
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                </div>

                {/* Continue */}
                <div className="flex justify-end pt-4">
                    <Button
                        type="button"
                        onClick={onNext}
                        disabled={!canProceed}
                        className="px-14 py-6 text-white font-bold text-lg bg-[#6e08b8] hover:bg-[#5a0699]"
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}