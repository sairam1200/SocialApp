import Image from "next/image";
import { Bookmark, Share2, Play } from "lucide-react";
import { PreviewProps } from "./types";
export default function PinterestPreview({
    values,
    media,
    profile
}: PreviewProps) {
    const isVideo =
        media?.type === "video" ||
        values.postType?.toLowerCase() === "video";
    const profileImage =
        profile?.profileImage || "/images/avatar-placeholder.svg";
    const profileName = profile?.name || "Username";
    return (
        
            <div className="w-80 bg-[#D4D4D6]">
                {/* =====================
            VIDEO PIN
        ====================== */}
                {isVideo ? (
                    <div className="overflow-hidden rounded-[28px] bg-black">
                        <div className="relative flex justify-center bg-black rounded-[28px] overflow-hidden">
                            {media?.type === "video" ? (
                                <video
                                    src={media.previewUrl}
                                    controls
                                    className="max-h-[550px] w-auto max-w-full object-contain"
                                />
                            ) : (
                                <div className="relative aspect-[3/5] w-auto">
                                    <Image
                                        src={media?.previewUrl ?? ""}
                                        fill
                                        alt=""
                                        className="object-cover"
                                    />
                                </div>
                            )} 
              
                            {/* Top Back */}
                            <button className="absolute top-4 left-4 bg-white rounded-xl p-3">
                                ←
                            </button>

                            {/* Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/90 rounded-full p-5">
                                    <Play
                                        className="size-8 fill-black"
                                    />
                                </div>
                            </div>

                            {/* Caption */}
                            <div className="absolute bottom-14 left-4 text-white">
                                <p className="font-semibold">
                                    {profileName}
                                </p>

                                <p className="text-sm line-clamp-2">
                                    {values.caption}
                                </p>
                            </div>

                            {/* Side Actions */}
                            <div className="absolute right-3 bottom-10 flex flex-col gap-6 text-white">
                                <div className="text-center">
                                    ❤️
                                    <div className="text-xs">
                                        81.7K
                                    </div>
                                </div>

                                <div className="text-center">
                                    💬
                                    <div className="text-xs">
                                        382
                                    </div>
                                </div>

                                <div className="text-center">
                                    ↗
                                    <div className="text-xs">
                                        833
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* =====================
                       IMAGE PIN
                    ====================== */
                    <div className="bg-white rounded-[28px] overflow-hidden shadow-sm">
                        <div className="relative aspect-[4/5]">
                            {media ? (
                                <Image
                                    src={media.previewUrl}
                                    alt=""
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    No image selected
                                </div>
                            )}

                            {/* Save Button */}
                            <button className="absolute top-4 right-4 bg-red-600 text-white font-semibold px-5 py-3 rounded-2xl">
                                Save
                            </button>

                            {/* Share */}
                            <button className="absolute bottom-4 right-4 bg-white rounded-2xl p-3 shadow">
                                <Share2 className="size-5" />
                            </button>
                        </div>

                        <div className="p-4">
                            <p className="font-semibold text-lg line-clamp-2">
                                {values.caption ||
                                    "Amazing Pinterest Pin"}
                            </p>

                            <div className="mt-3 flex items-center gap-2">
                                <Image
                                                                      src={profileImage}
                                                                      alt={profileName}
                                                                      width={32}
                                                                      height={32}
                                                                      className="overflow-hidden rounded-full"
                                                                  />

                                <span className="text-sm font-medium">
                                   {profileName}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        
    );
}