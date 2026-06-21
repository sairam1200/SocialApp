import Image from "next/image";
import { PreviewProps } from "@/components/create-post/previews/types";
import { BookmarkIcon, Ellipsis, Heart, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/utils/cn.util";
export default function InstagramPreview({
    values,
    media,
    profile
}: PreviewProps) {
    const isReel = values.postType === "reel";
    const isStory = values.postType === "story";
    const mediaClass = isStory
        ? "w-[180px] h-[320px]"
        : isReel
            ? "w-[230px] h-[285px]"
            : "w-full h-[180px]"
    // Story Preview
    if (isStory) {
        return (
            <div className="bg-[#D4D4D6] rounded-lg p-3 flex justify-center">
                <div className="relative aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-xl bg-black">
                    {media ? (
                        media.type === "image" ? (
                            <Image
                                src={media.previewUrl}
                                fill
                                alt=""
                                className="object-cover"
                            />
                        ) : (
                            <video
                                src={media.previewUrl}
                                controls
                                className="h-full w-full object-cover"
                            />
                        )
                    ) : (
                        <div className="flex h-full items-center justify-center text-white text-sm">
                            No media selected
                        </div>
                    )}

                    {/* Story Header */}
                    <div className="absolute top-0 left-0 right-0 p-3 flex items-center gap-2 bg-gradient-to-b from-black/60 to-transparent">
                        <div className="size-8 rounded-full bg-linear-to-tr from-[#C27AFF] to-[#FB64B6]" />
                        <div>
                            <Image
                                src={
                                    profile?.profileImage ||
                                    "/images/avatar-placeholder.png"
                                }
                                alt={profile?.name || "Profile"}
                                width={32}
                                height={32}
                                className="size-8 rounded-full object-cover border border-white"
                            />

                            <p className="text-white text-xs font-medium">
                                {profile?.name || "Username"}
                            </p>
                            <p className="text-white/70 text-[10px]">
                                Just now
                            </p>
                        </div>
                    </div>

                    {/* Story Caption */}
                    <div className="absolute bottom-6 left-4 right-4">
                        <p className="text-white text-sm">
                            {values.caption}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Feed Post + Reel
    return (
        <div className="bg-[#D4D4D6] rounded-lg p-3 flex items-start justify-center border border-[#D4D4D4] w-full">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm w-full flex flex-col text-[#101828]">
                {/* Header */}
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-6 rounded-full bg-linear-to-tr from-[#C27AFF] to-[#FB64B6]" />
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold">
                                Username
                            </span>
                            <span className="text-[10px] text-[#6A7282]">
                                Just now
                            </span>
                        </div>
                    </div>

                    <Ellipsis className="size-5" />
                </div>

                {/* Media */}
                <div
                    className={cn(
                        "relative w-full bg-gray-100",
                        mediaClass
                    )}
                >
                    {media ? (
                        media.type === "image" ? (
                            <Image
                                src={media.previewUrl}
                                fill
                                alt=""
                                className="object-cover"
                            />
                        ) : (
                            <video
                                src={media.previewUrl}
                                controls
                                className="h-full w-full object-cover"
                            />
                        )
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400 text-xs">
                            No media selected
                        </div>
                    )}

                    {isReel && (
                        <div className="absolute top-3 left-3">
                            <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
                                Reel
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Heart className="size-5" />
                            <MessageCircle className="size-5" />
                            <Send className="size-5" />
                        </div>

                        <BookmarkIcon className="size-5" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#364153]">
                            1,234 likes
                        </span>

                        <div className="text-xs flex gap-2">
                            <span className="font-semibold">
                                Username
                            </span>

                            <span className="text-[#364153] line-clamp-2">
                                {values.caption ||
                                    "Something here"}
                            </span>
                        </div>

                        {isReel && (
                            <span className="text-[10px] text-gray-500">
                                Instagram Reel
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}