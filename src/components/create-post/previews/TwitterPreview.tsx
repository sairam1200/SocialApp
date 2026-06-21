import Image from "next/image";
import { PreviewProps } from "@/components/create-post/previews/types";
import { BookmarkIcon, Ellipsis, Heart, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/utils/cn.util";
export default function TwitterPreview({
    values,
}: PreviewProps) {
    return (
        <div className="bg-white rounded-lg p-4 border">
            <div className="flex gap-3">
                <div className="size-10 rounded-full bg-gray-300" />

                <div>
                    <div className="font-semibold">
                        Username
                    </div>

                    <p className="mt-2 text-sm">
                        {values.caption}
                    </p>
                </div>
            </div>
        </div>
    );
}