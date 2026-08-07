
"use client";
import { Pencil, User } from "lucide-react";
import { ShareIcon } from "@/components/ui/share-icon";
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card p-8 rounded-4xl border border-indigo-100 shadow-lg w-full max-w-3xl mx-auto mb-10">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-foreground mb-2">Review profile</h2>
                <p className="text-sm text-muted-foreground">Here&apos;s your profile summary. You can edit or update it anytime.</p>
            </div>

            <div className="space-y-8">
                <section className="relative pb-6 border-b border-gray-250">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-foreground">1. About you</h3>
                        <button
                            onClick={() => onEdit(1)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary/80 transition-all"
                            aria-label="Edit about you section"
                        >
                            <Pencil size={12} /> Edit section
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-muted rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
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
                                <User className="text-muted-foreground" size={24} />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{formData.bio || "No bio provided."}</p>
                    </div>
                </section>

                <section className="relative pb-6 border-b border-border">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-foreground">2. Interests</h3>
                        <button
                            onClick={() => onEdit(2)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary/80 transition-all"
                            aria-label="Edit interests section"
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
                            <p className="text-sm text-muted-foreground italic">No interests selected.</p>
                        )}
                    </div>
                </section>

                <section className="relative pb-10">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-foreground">3. Connected profiles</h3>
                        <button
                            onClick={() => onEdit(3)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary/80 transition-all"
                            aria-label="Edit connected profiles section"
                        >
                            <Pencil size={12} /> Edit section
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(formData.connectedAccounts).length > 0 ? (
                            Object.keys(formData.connectedAccounts).map((platform) => (
                                <span
                                    key={platform}
                                    className="flex items-center gap-4 px-4 py-1.5 border border-border text-muted-foreground rounded-full text-xs font-medium bg-card"
                                >
                                    <ShareIcon size={12} /> {platform}
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No accounts connected.</p>
                        )}
                    </div>
                </section>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                <button
                    onClick={onBack}
                    className="flex-1 py-4 border-2 border-primary text-primary rounded-full font-bold text-lg hover:bg-indigo-50 transition-all"
                    aria-label="Go back to previous step"
                >
                    Go back
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-primary text-white hover:bg-primary/80 rounded-full font-bold text-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    aria-label="Create profile"
                >
                    {isSubmitting ? "Processing..." : "Create profile"}
                </button>
            </div>
        </div>
    );
}
