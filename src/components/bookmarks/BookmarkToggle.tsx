"use client";

import Image from "next/image";
import { useBookmarks } from "@/contexts/BookmarkContext";

type BookmarkToggleProps = {
  contentId: string;
  platform?: string;
  title?: string;
  contentUrl?: string;
  thumbnailUrl?: string;
  type?: string;
};

export default function BookmarkToggle({
  contentId,
  platform,
  title,
  contentUrl,
  thumbnailUrl,
  type,
}: BookmarkToggleProps) {
  const { isSaved, toggleBookmark } = useBookmarks();
  const saved = isSaved(contentId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(contentId, { platform, title, contentUrl, thumbnailUrl, type });
  };

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove bookmark" : "Save bookmark"}
      className="flex items-center justify-center hover:opacity-70 transition cursor-pointer"
    >
      <Image
        src={saved ? "/icons/bookmarkActive.svg" : "/icons/bookmark.svg"}
        alt="Bookmark"
        width={16}
        height={16}
      />
    </button>
  );
}