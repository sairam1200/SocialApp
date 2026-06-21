import Image from "next/image";
import { PreviewProps } from "@/components/create-post/previews/types";
import { BookmarkIcon, Ellipsis, Heart, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/utils/cn.util";
export default function RedditPreview({
    values,
    media,
}: PreviewProps) {
    return (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold text-black">
                        r/programming
                    </span>

                    <span>•</span>

                    <span>Posted by u/username</span>

                    <span>2h ago</span>
                </div>

                <h2 className="font-semibold text-base mt-2">
                    {values.caption || "Post title"}
                </h2>
            </div>

            {/* Media */}
            {media && (
                <div className="relative aspect-video bg-gray-100">
                    {media.type === "image" ? (
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
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-6 px-4 py-3 text-sm text-gray-600 border-t">
                <span>⬆️ 1.2k</span>

                <span>💬 146</span>

                <span>🔗 Share</span>

                <span>💾 Save</span>
            </div>
        </div>
    );
}