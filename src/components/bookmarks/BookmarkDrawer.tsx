'use client';

type BookmarkDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function BookmarkDrawer({ open, onClose }: BookmarkDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-popover p-6 text-popover-foreground shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Save post in your collections
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <input
          placeholder="Search collections"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />

        {/* Tabs */}
        <div className="mt-4 flex gap-4 text-sm font-medium">
          <button className="border-b-2 border-primary pb-1 text-primary">
            Recommended
          </button>
          <button className="text-muted-foreground">
            All collections
          </button>
        </div>

        {/* Collections */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <button className="rounded-lg border border-border p-4 text-center hover:bg-muted">
            Travel
          </button>
          <button className="rounded-lg border border-border p-4 text-center hover:bg-muted">
            Work
          </button>
        </div>
      </div>
    </div>
  );
}
