import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProfileCard from "./PorfileCard";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/hooks/useFollowUser", () => ({
  useFollowUser: () => ({
    isFollowing: false,
    followersCount: 1234,
    followingCount: 56,
    isPending: false,
    toggleFollow: vi.fn(),
    canFollow: true,
  }),
}));
vi.mock("@/hooks/useIsOwnProfile", () => ({ useIsOwnProfile: () => false }));
vi.mock("@/providers/HttpContextProvider", () => ({
  useHttpContext: () => ({ isAuthenticated: false }),
}));
vi.mock("@/components/ui/user-avatar", () => ({
  UserAvatar: () => <div data-testid="avatar" />,
}));

describe("ProfileCard compact variant", () => {
  it("uses the Discover content-card height and non-overlapping stat grid", () => {
    render(
      <ProfileCard
        compact
        profilePicSrc={null}
        userName="A very long creator name that must be truncated"
        userHandle="@creator"
        category="Design"
        postCount={12}
        followerCount={1234}
        followingCount={56}
        linkedAccounts={[]}
      />,
    );

    expect(screen.getByText("A very long creator name that must be truncated")).toBeInTheDocument();
    expect(screen.getByText("Followers").parentElement).toHaveClass("min-w-0");
    expect(screen.getByText("Followers").parentElement?.parentElement).toHaveClass("grid-cols-3");
    expect(screen.getByText("View profile").closest("div[class*='h-[440px]']")).toBeTruthy();
  });
});
