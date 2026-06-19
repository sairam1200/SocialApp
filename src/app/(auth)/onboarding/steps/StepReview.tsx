
"use client";
import { Pencil, Share2, User } from "lucide-react";
import type { ProfileFormData ,Interest } from "./types";
import Image from "next/image";

interface StepFourReviewProps {
    formData: ProfileFormData;
    topics: Interest[];
    onBack: () => void;
    onEdit: (step: number) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function StepFourReview({
    formData,
    topics,
    onBack,
    onEdit,
    onSubmit,
    isSubmitting,
}: StepFourReviewProps) 
{
    const topicMap = Object.fromEntries(
    topics.map(t => [t.id, t.name])
);
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-4xl border border-indigo-100 shadow-lg w-full max-w-3xl mx-auto mb-10">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Review profile</h2>
                <p className="text-sm text-gray-500">Here&apos;s your profile summary. You can edit or update it anytime.</p>
            </div>

            <div className="space-y-8">
                <section className="relative pb-6 border-b border-gray-250">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900">1. About you</h3>
                        <button
                            onClick={() => onEdit(1)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6e08b8] text-white rounded-full text-xs font-semibold hover:bg-[#5a0699] transition-all"
                        >
                            <Pencil size={12} /> Edit section
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                            {formData.profileImagePreview ? (
                                <Image
                                    src={formData.profileImagePreview}
                                    alt="Profile preview"
                                    width={48}
                                    height={48}
                                    unoptimized
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="text-gray-400" size={24} />
                            )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{formData.bio || "No bio provided."}</p>
                    </div>
                </section>

                <section className="relative pb-6 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900">2. Interests</h3>
                        <button
                            onClick={() => onEdit(2)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6e08b8] text-white rounded-full text-xs font-semibold hover:bg-[#5a0699] transition-all"
                        >
                            <Pencil size={12} /> Edit section
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.interests.length > 0 ? (
                            formData.interests.map((topicId) => (
                                <span
                                    key={topicId}
                                    className="px-4 py-1.5 border border-indigo-200 text-indigo-700 rounded-full text-xs font-medium bg-indigo-50/30"
                                >
                                    • {topicMap[topicId] ?? topicId}
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 italic">No interests selected.</p>
                        )}
                    </div>
                </section>

                <section className="relative pb-10">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900">3. Connected profiles</h3>
                        <button
                            onClick={() => onEdit(3)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6e08b8] text-white rounded-full text-xs font-semibold hover:bg-[#5a0699] transition-all"
                        >
                            <Pencil size={12} /> Edit section
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(formData.connectedAccounts).length > 0 ? (
                            Object.keys(formData.connectedAccounts).map((platform) => (
                                <span
                                    key={platform}
                                    className="flex items-center gap-4 px-4 py-1.5 border border-gray-200 text-gray-700 rounded-full text-xs font-medium bg-white"
                                >
                                    <Share2 size={12} /> {platform}
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 italic">No accounts connected.</p>
                        )}
                    </div>
                </section>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                <button
                    onClick={onBack}
                    className="flex-1 py-4 border-2 border-[#6e08b8] text-[#6e08b8] rounded-full font-bold text-lg hover:bg-indigo-50 transition-all"
                >
                    Go back
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-[#6e08b8] text-white hover:bg-[#5a0699] rounded-full font-bold text-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? "Processing..." : "Create profile"}
                </button>
            </div>
        </div>
    );
}
