"use client";

import Image from "next/image";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useHttpContext } from "@/providers/HttpContextProvider";
import toast from "react-hot-toast";
import { useState } from "react";
import { useTranslations } from "next-intl";
import BookmarkDrawer from "./BookmarkDrawer";

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
  const t = useTranslations("bookmark");
  const { isSaved, toggleBookmark, markSaved } = useBookmarks();
  const { isAuthenticated } = useHttpContext();
  const saved = isSaved(contentId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast(t("loginRequired"));
      return;
    }

    if (saved) {
      // Removing a known bookmark is unambiguous, so it should behave like a
      // normal toggle. The collection picker is only needed while saving.
      void toggleBookmark(contentId, {
        platform,
        title,
        contentUrl,
        thumbnailUrl,
        type,
      });
      return;
    }

    setPickerOpen(true);
  };

  const bookmarkData = {
    contentId,
    platform,
    title,
    contentUrl,
    thumbnailUrl,
    type,
  };

  return (
    <>
      <button
        onClick={handleClick}
        data-result-action="bookmark"
        aria-label={
          isAuthenticated
            ? saved
              ? t("remove")
              : t("save")
            : t("loginRequired")
        }
        title={isAuthenticated ? undefined : t("loginRequired")}
        className="relative z-20 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent/20 shadow-sm ring-1 ring-border/70 transition hover:bg-accent/35"
      >
        <Image
          src={saved ? "/icons/bookmarkActive.svg" : "/icons/bookmark.svg"}
          alt=""
          width={16}
          height={16}
          className="dark:invert"
        />
      </button>
      <BookmarkDrawer
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        content={bookmarkData}
        onSaved={() => {
          if (!saved)
            void toggleBookmark(contentId, {
              platform,
              title,
              contentUrl,
              thumbnailUrl,
              type,
            });
          markSaved(contentId);
        }}
      />
    </>
  );
}
