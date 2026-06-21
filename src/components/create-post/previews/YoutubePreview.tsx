import Image from "next/image";
import { PreviewProps } from "@/components/create-post/previews/types";
import { BookmarkIcon, Ellipsis, Heart, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/utils/cn.util";
export default function YoutubePreview({
  values,
  media,
}: PreviewProps) {
  const isShort = values.postType === "short";

  return (
    <div
      className={cn(
        "bg-white rounded-xl overflow-hidden shadow-sm mx-auto",
        isShort ? "max-w-[280px]" : "max-w-[420px]"
      )}
    >
      {/* Media */}
      <div
        className={cn(
          "relative bg-black",
          isShort ? "aspect-[9/16]" : "aspect-video"
        )}
      >
        {!media ? (
          <div className="flex h-full items-center justify-center text-white text-sm">
            No media selected
          </div>
        ) : media.type === "image" ? (
          <Image
            src={media.previewUrl}
            fill
            alt=""
            className="object-cover"
          />
        ) : (
          <video
            src={media.previewUrl}
            controls={!isShort}
            className="w-full h-full object-cover"
          />
        )}

        {/* Shorts UI */}
        {isShort && (
          <>
            <div className="absolute bottom-4 left-3 right-16 text-white">
              <p className="text-sm line-clamp-2">
                {values.caption || "Short description"}
              </p>
            </div>

            <div className="absolute right-2 bottom-6 flex flex-col gap-5 text-white items-center">
              <div className="text-center">
                👍
                <div className="text-xs">459K</div>
              </div>

              <div className="text-center">
                💬
                <div className="text-xs">927</div>
              </div>

              <div className="text-center">
                ↗
                <div className="text-xs">Share</div>
              </div>
            </div>
          </>
        )}

        {/* Normal Video Duration */}
        {!isShort && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            2:35
          </span>
        )}
      </div>

      {/* Normal YouTube Video Info */}
      {!isShort && (
        <div className="p-3 flex gap-3">
          <div className="size-10 rounded-full bg-red-500 shrink-0" />

          <div className="flex-1">
            <h3 className="font-semibold text-sm line-clamp-2">
              {values.caption || "Video Title"}
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Channel Name ✓
            </p>

            <p className="text-xs text-gray-500">
              1.1M views • 3 days ago
            </p>
          </div>

          <button className="text-xl text-gray-500">
            ⋮
          </button>
        </div>
      )}
    </div>
  );
}