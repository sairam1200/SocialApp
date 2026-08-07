import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BookmarkToggle from "./BookmarkToggle";

const bookmarkMocks = vi.hoisted(() => ({
  saved: true,
  toggleBookmark: vi.fn(async () => undefined),
  markSaved: vi.fn(),
}));

vi.mock("@/contexts/BookmarkContext", () => ({
  useBookmarks: () => ({
    isSaved: () => bookmarkMocks.saved,
    toggleBookmark: bookmarkMocks.toggleBookmark,
    markSaved: bookmarkMocks.markSaved,
  }),
}));

vi.mock("@/providers/HttpContextProvider", () => ({
  useHttpContext: () => ({ isAuthenticated: true }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({
      save: "Save bookmark",
      remove: "Remove bookmark",
      loginRequired: "Log in to save bookmarks.",
    })[key] ?? key,
}));

vi.mock("./BookmarkDrawer", () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div role="dialog">Collection picker</div> : null,
}));

describe("BookmarkToggle", () => {
  beforeEach(() => {
    bookmarkMocks.saved = true;
    bookmarkMocks.toggleBookmark.mockClear();
    bookmarkMocks.markSaved.mockClear();
  });

  it("removes a saved bookmark directly without opening the collection picker", async () => {
    render(<BookmarkToggle contentId="post-1" title="A post" />);

    fireEvent.click(screen.getByRole("button", { name: "Remove bookmark" }));

    await waitFor(() =>
      expect(bookmarkMocks.toggleBookmark).toHaveBeenCalledWith(
        "post-1",
        expect.objectContaining({ title: "A post" }),
      ),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the collection picker when saving a new bookmark", () => {
    bookmarkMocks.saved = false;
    render(<BookmarkToggle contentId="post-2" />);

    fireEvent.click(screen.getByRole("button", { name: "Save bookmark" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(bookmarkMocks.toggleBookmark).not.toHaveBeenCalled();
  });
});
