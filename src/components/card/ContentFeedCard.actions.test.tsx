import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ContentFeedCard from "./ContentFeedCard";

vi.mock("@/components/bookmarks/BookmarkToggle", () => ({
  default: () => <button type="button">Bookmark</button>,
}));

const requiredProps = {
  contentId: "post-1",
  profilePicSrc: null,
  userName: "Alex",
  platform: "YouTube",
  textContent: "External result",
  stats: [],
  sourceUrl: "https://youtube.com/watch?v=1",
};

describe("ContentFeedCard actions", () => {
  it("uses the external-result offset when the card has no thumbnail", () => {
    render(<ContentFeedCard {...requiredProps} />);

    expect(screen.getByTestId("content-card-actions")).toHaveStyle({
      marginTop: "var(--content-card-action-offset, 0rem)",
    });
  });

  it("keeps the normal action alignment when a thumbnail separates the badge", () => {
    render(
      <ContentFeedCard
        {...requiredProps}
        imageSrc="https://cdn.example.com/thumbnail.jpg"
      />,
    );

    expect(screen.getByTestId("content-card-actions")).not.toHaveAttribute(
      "style",
    );
  });
});
