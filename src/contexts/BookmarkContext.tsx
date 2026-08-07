"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { apiClient } from "@/services/apiClient.service";
import type { AddBookmarkContentBody } from "@/services/api/bookmark.service";
import { useBookmarkSocket } from "@/hooks/useBookmarkSocket";
import { useHttpContext } from "@/providers/HttpContextProvider";
import { ClaimTypes } from "@/constants/globals";

type BookmarkContextType = {
  isSaved: (contentId: string) => boolean;
  toggleBookmark: (contentId: string, data?: Omit<AddBookmarkContentBody, "contentId">) => Promise<void>;
  markSaved: (contentId: string) => void;
  loading: boolean;
};

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useHttpContext();
  const userId = user?.[ClaimTypes.UserId];
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const inFlightIds = useRef(new Set<string>());

  useBookmarkSocket(
    useCallback((contentId: string) => {
      setSavedIds((prev) => prev.has(contentId) ? prev : new Set(prev).add(contentId));
    }, []),
    useCallback((contentId: string) => {
      setSavedIds((prev) => {
        if (!prev.has(contentId)) return prev;
        const next = new Set(prev);
        next.delete(contentId);
        return next;
      });
    }, []),
  );

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setBookmarkId(null);
      setSavedIds(new Set());
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    apiClient.Bookmark.getBookmarks()
      .then((res) => {
        if (!active) return;
        setBookmarkId(res.id);
        const contentIds = (res.contents ?? [])
          .map((c) => c.contentId)
          .filter(Boolean);
        setSavedIds(new Set(contentIds));
      })
      .catch(() => {
        if (active) setSavedIds(new Set());
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [isAuthenticated, userId]);

  const isSaved = useCallback(
    (contentId: string) => savedIds.has(contentId),
    [savedIds]
  );

  const markSaved = useCallback((contentId: string) => {
    setSavedIds((previous) => previous.has(contentId)
      ? previous
      : new Set(previous).add(contentId));
  }, []);

  const toggleBookmark = useCallback(
    async (contentId: string, data?: Omit<AddBookmarkContentBody, "contentId">) => {
      if (!isAuthenticated || !bookmarkId || inFlightIds.current.has(contentId)) return;
      inFlightIds.current.add(contentId);
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
      } finally {
        inFlightIds.current.delete(contentId);
      }
    },
    [bookmarkId, savedIds, isAuthenticated]
  );

  return (
    <BookmarkContext.Provider value={{ isSaved, toggleBookmark, markSaved, loading }}>
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
