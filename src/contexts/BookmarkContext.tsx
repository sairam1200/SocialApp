"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { apiClient } from "@/services/apiClient.service";
import type { AddBookmarkContentBody } from "@/services/api/bookmark.service";

type BookmarkContextType = {
  isSaved: (contentId: string) => boolean;
  toggleBookmark: (contentId: string, data?: Omit<AddBookmarkContentBody, "contentId">) => Promise<void>;
  loading: boolean;
};

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.Bookmark.getBookmarks()
      .then((res) => {
        setBookmarkId(res.id);
        setSavedIds(new Set(res.contents.map((c: any) => c.contentId)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isSaved = useCallback(
    (contentId: string) => savedIds.has(contentId),
    [savedIds]
  );

  const toggleBookmark = useCallback(
    async (contentId: string, data?: Omit<AddBookmarkContentBody, "contentId">) => {
      if (!bookmarkId) return;
      const wasSaved = savedIds.has(contentId);

      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(contentId);
        else next.add(contentId);
        return next;
      });

      try {
        if (wasSaved) {
          await apiClient.Bookmark.removeContent(bookmarkId, contentId);
        } else {
          await apiClient.Bookmark.addContent(bookmarkId, { contentId, ...data });
        }
      } catch (err) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(contentId);
          else next.delete(contentId);
          return next;
        });
      }
    },
    [bookmarkId, savedIds]
  );

  return (
    <BookmarkContext.Provider value={{ isSaved, toggleBookmark, loading }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return ctx;
}