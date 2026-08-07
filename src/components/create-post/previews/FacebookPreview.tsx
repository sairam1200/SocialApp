import Image from "next/image";
import { PreviewProps } from "@/components/create-post/previews/types";
import { cn } from "@/utils/cn.util";
export default function FacebookPreview({
    values,
    media,
    profile,
}: PreviewProps) {
    const postType = values.postType?.toLowerCase();
    const profileImage =
        profile?.profileImage || "/images/avatar-placeholder.svg";
    const profileName = profile?.name || "Username";
    const isMetaImage =
        profileImage.includes("fbcdn.net") ||
        profileImage.includes("cdninstagram.com");
    const renderMedia = (
        className: string,
        showControls = false
    ) => {
        if (!media) {
            return (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No media selected
                </div>
            );
        }

        if (media.type === "image") {
            return (
                <Image
                    src={media.previewUrl}
                    fill
                    alt=""
                    className="object-cover"
                />
            );
        }

        return (
            <video
                src={media.previewUrl}
                controls={showControls}
                className={className}
            />
        );
    };

    // ========================
    // STORY
    // ========================
    if (postType === "story") {
        return (
            <div className="bg-[#D4D4D6] rounded-lg p-4 flex justify-center">
                <div className="relative w-[220px] h-[390px] rounded-xl overflow-hidden bg-black">
                    <div className="absolute inset-0">
                        {renderMedia("h-full w-full object-cover")}
                    </div>

                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">

                        <Image
                            src={profileImage}
                            alt={profileName}
                            width={32}
                            height={32}
                            unoptimized={isMetaImage}
                            className="overflow-hidden rounded-full"
                        />
                        <div>
                            <p className="text-white text-xs font-medium">
                                {profileName}
                            </p>

                            <p className="text-white/70 text-[10px]">
                                Just now
                            </p>
                        </div>
                    </div>

                    <div className="absolute bottom-5 left-4 right-4 z-10">
                        <p className="text-white text-sm">
                            {values.caption}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ========================
    // REEL
    // ========================
    if (postType === "reel") {
        return (

            <div className="relative w-[260px] h-[420px] rounded-xl overflow-hidden bg-black">
                <div className="absolute inset-0">
                    {renderMedia("h-full w-full object-cover")}
                </div>

                {/* Actions */}
                <div className="absolute right-3 bottom-8 flex flex-col gap-5 text-white items-center">
                    <div className="text-center">
                        👍
                        <div className="text-xs">81.7K</div>
                    </div>

                    <div className="text-center">
                        💬
                        <div className="text-xs">382</div>
                    </div>

                    <div className="text-center">
                        ↗
                        <div className="text-xs">833</div>
                    </div>

                    <div className="text-center">
                        ⋯
                    </div>
                </div>

                {/* Creator */}
                <div className="absolute left-4 bottom-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Image
                            src={profileImage}
                            alt={profileName}
                            width={32}
                            height={32}
                            unoptimized={isMetaImage}
                            className="overflow-hidden rounded-full bg-blue"
                        />

                        <span className="font-medium">
                            {profileName}
                        </span>
                    </div>

                    <p className="text-sm line-clamp-2">
                        {values.caption}
                    </p>
                </div>
            </div>

        );
    }

    // ========================
    // NORMAL POST
    // ========================
    return (
        <div className="bg-white relative w-240 rounded-lg overflow-hidden border shadow-sm">
            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                <Image
                    src={profileImage}
                    alt={profileName}
                    width={32}
                    height={32}
                    unoptimized={isMetaImage}
                    className="overflow-hidden rounded-full bg-blue"
                />

                <div>
                    <p className="font-semibold text-sm">
                        {profileName}
                    </p>

                    <p className="text-xs text-gray-500">
                        Just now · 🌎
                    </p>
                </div>
            </div>

            {/* Caption */}
            <div className="px-4 pb-3">
                <p className="text-sm break-words whitespace-pre-wrap overflow-hidden">
                    {values.caption || "What's on your mind?"}
                </p>
            </div>

            {/* Media */}
            <div className="relative aspect-video bg-gray-100">
                {renderMedia("h-full w-full object-cover", true)}
            </div>

            {/* Stats */}
            <div className="px-4 py-2 border-b text-xs text-gray-500 flex justify-between">
                <span>5.5K react...</span>

                <span>232 com... </span>
                <span>• 1K shares</span>
            </div>

            {/* Actions */}

        </div>
    );
}