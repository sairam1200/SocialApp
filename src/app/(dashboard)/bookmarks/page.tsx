'use client';

import { useState } from 'react';
import BookmarkToggle from '@/components/bookmarks/BookmarkToggle';
import BookmarkDrawer from '@/components/bookmarks/BookmarkDrawer';

export default function Page() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold">Bookmarks</h1>

      <BookmarkToggle onOpen={() => setDrawerOpen(true)} />

      <BookmarkDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
