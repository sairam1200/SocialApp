'use client';

import { useState } from 'react';

type BookmarkToggleProps = {
  onOpen: () => void;
};

export default function BookmarkToggle({ onOpen }: BookmarkToggleProps) {
  const [saved, setSaved] = useState(false);

  const handleClick = () => {
    setSaved((prev) => !prev);
    onOpen();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
      aria-label="Save post"
    >
      <span>{saved ? '★' : '☆'}</span>
      <span>{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
