'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/apiClient.service';
import ContentFeedCard from '@/components/card/ContentFeedCard';
import { useBookmarkSocket } from '@/hooks/useBookmarkSocket';
import { normalizeBookmarkContent } from '@/lib/card-helpers';
import type { BookmarkResponse } from '@/services/api/bookmark.service';
import { useHttpContext } from '@/providers/HttpContextProvider';
import DialogContainer from '@/components/dialog/DialogContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FolderHeart } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function BookmarksPageContent() {
  const tCollections = useTranslations('collections');
  const { isAuthenticated } = useHttpContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [contents, setContents] = useState<BookmarkResponse['contents']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBookmarks = useCallback(() => {
    if (!isAuthenticated) {
      setContents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    apiClient.Bookmark.getBookmarks()
      .then((res) => setContents(res.contents ?? []))
      .catch(() => {
        setContents([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useBookmarkSocket(fetchBookmarks, fetchBookmarks);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    setShowAuthDialog(!isAuthenticated);
  }, [isAuthenticated]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Bookmarks</h1>
        <Button asChild variant="outline">
          <Link href="/collections">
            <FolderHeart className="size-4" aria-hidden="true" />
            {tCollections('browse')}
          </Link>
        </Button>
      </div>

      {!isAuthenticated ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Log in to view and save bookmarks.</p>
          <Button className="mt-4" onClick={() => setShowAuthDialog(true)}>Log in or sign up</Button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 font-semibold">Failed to load bookmarks.</p>
          <button
            onClick={fetchBookmarks}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : contents.length === 0 ? (
        <div className="text-gray-500">No bookmarks yet.</div>
      ) : (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            maxWidth: "100%",
          }}
        >
          {contents.map((item) => {
            const cardProps = normalizeBookmarkContent(item);
            return (
              <div key={item.id}>
                <ContentFeedCard
                  {...cardProps}
                  contentId={item.contentId}
                />
              </div>
            );
          })}
        </div>
      )}

      <DialogContainer
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        title="Log in or sign up"
        maxWidthClass="max-w-lg"
        footer={<div className="flex justify-end gap-4"><Link href="/login"><Button variant="secondary">Log in</Button></Link><Link href="/signup"><Button>Sign up</Button></Link></div>}
      >
        <p className="text-sm">Log in to view and save bookmarks.</p>
      </DialogContainer>
    </div>
  );
}
