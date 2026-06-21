
import Image from "next/image";
import { PreviewProps } from "@/components/create-post/previews/types";
import {
    Ellipsis,
    Heart,
    MessageCircle,
    Send,
    Repeat2,
    ThumbsUp,
} from "lucide-react";

export default function LinkedInPreview({
    values,
    media,
}: PreviewProps) {
    return (
        <div className="w-full max-w-[460px] min-w-0 mx-auto overflow-hidden rounded-xl border bg-white shadow-sm">
            {/* Repost Banner */}
            <div className="border-b px-4 py-2 text-xs text-gray-500">
                <span className="font-semibold text-[#0A66C2]">LinkedIn</span>{" "}
                reposted this
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex flex-1 min-w-0 gap-3">
                    <div className="size-12 shrink-0 rounded-full bg-[#0A66C2]" />

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 min-w-0">
                            <h3 className="truncate text-sm font-semibold">
                                John Doe
                            </h3>

                            <span className="shrink-0 text-gray-400">•</span>

                            <span className="shrink-0 text-xs text-gray-500">
                                Following
                            </span>
                        </div>

                        <p className="truncate text-xs text-gray-500">
                            Software Engineer | Creator
                        </p>

                        <p className="text-xs text-gray-500">
                            1w • 🌎
                        </p>
                    </div>
                </div>

                <button className="shrink-0 text-gray-500 hover:text-gray-700">
                    <Ellipsis size={18} />
                </button>
            </div>

            {/* Caption */}
            {values.caption && (
                <div className="px-4 pb-3">
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {values.caption}
                    </p>
                </div>
            )}

            {/* Media */}
            {media && (
                <div className="relative aspect-[4/3] bg-gray-100">
                    {media.type === "image" ? (
                        <Image
                            src={media.previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <video
                            src={media.previewUrl}
                            controls
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>
            )}

            {/* Engagement */}
            <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <span>👍</span>
                    <span>👏</span>
                    <span>❤️</span>
                    <span className="ml-1">645</span>
                </div>

                <span className="truncate">
                    5 comments • 52 reposts
                </span>
            </div>


            {/* Actions */}
            <div className="grid grid-cols-3 border-t">
                <button className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                    <ThumbsUp size={16} />
                    <span className="hidden sm:inline">Like</span>
                </button>

                <button className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                    <MessageCircle size={16} />
                    <span className="hidden sm:inline">Comment</span>
                </button>

                <button className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                    <Repeat2 size={16} />
                    <span className="hidden sm:inline">Repost</span>
                </button>
            </div>

        </div>
    );
}

