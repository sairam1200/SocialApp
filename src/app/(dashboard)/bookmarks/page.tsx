'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient.service';
import ContentFeedCard from '@/components/card/ContentFeedCard';
import { renderPlatformIcon } from '@/lib/card-helpers';

export default function Page() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.Bookmark.getBookmarks()
      .then((res) => setContents(res.contents ?? []))
      .catch(() => setContents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold">Bookmarks</h1>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : contents.length === 0 ? (
        <div className="text-gray-500">No bookmarks yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((item) => (
            <ContentFeedCard
              key={item.id}
              contentId={item.contentId}
              imageSrc={item.thumbnailUrl || undefined}
              profilePicSrc={null}
              userName={item.addedBy?.displayName || 'Unknown'}
              userHandle={item.addedBy?.userName ? `@${item.addedBy.userName}` : ''}
              platformIcon={renderPlatformIcon(item.platform)}
              textContent={item.title || item.description || 'Saved content'}
              date={undefined}
              stats={[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
