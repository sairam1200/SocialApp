import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/i18n/messages/en.json";
import type { PublishItem } from "@/types/publishing.types";
import { MonthGrid } from "./MonthGrid";
import { PostDetail } from "./PostDetail";
import { QueueList } from "./QueueList";
import { accentFor } from "./channel-theme";

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
      {ui}
    </NextIntlClientProvider>,
  );
}

function makeItem(overrides: Partial<PublishItem> = {}): PublishItem {
  return {
    id: "job-1",
    platform: "instagram",
    linkedAccountId: "acct-1",
    status: "scheduled",
    deliveryMode: "queued",
    postFormat: "image",
    at: "2026-09-15T09:30:00.000Z",
    title: "",
    excerpt: "Behind the scenes from the workshop",
    progress: 0,
    attempts: 0,
    editable: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    ...overrides,
  };
}

describe("channel accents", () => {
  it("gives every known channel its own hue and never returns nothing", () => {
    const platforms = ["instagram", "youtube", "linkedin", "tiktok"];
    const accents = platforms.map(accentFor);
    expect(new Set(accents).size).toBe(platforms.length);
    // A channel we have not seen before still renders with a colour rather
    // than an empty string, which would collapse the rail to invisible.
    expect(accentFor("some-new-network")).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("month grid", () => {
  const month = new Date("2026-09-01T00:00:00.000Z");

  it("places a post on its own local day and shows its time", () => {
    renderWithIntl(
      <MonthGrid
        month={month}
        items={[makeItem()]}
        weekStartsOn={1}
        onSelect={vi.fn()}
        onMove={vi.fn()}
        onCompose={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Behind the scenes from the workshop"),
    ).toBeInTheDocument();
  });

  it("collapses a busy day and expands it on request", async () => {
    const user = userEvent.setup();
    const items = Array.from({ length: 5 }, (_, index) =>
      makeItem({
        id: `job-${index}`,
        excerpt: `Post number ${index}`,
        at: "2026-09-15T09:30:00.000Z",
      }),
    );

    renderWithIntl(
      <MonthGrid
        month={month}
        items={items}
        weekStartsOn={1}
        onSelect={vi.fn()}
        onMove={vi.fn()}
        onCompose={vi.fn()}
      />,
    );

    // Three visible, two behind the disclosure: a cell that renders all five
    // pushes the rest of the month off the screen.
    expect(screen.getByText("Post number 0")).toBeInTheDocument();
    expect(screen.queryByText("Post number 4")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "2 more" }));
    expect(screen.getByText("Post number 4")).toBeInTheDocument();
  });

  it("does not let a published post be dragged", () => {
    renderWithIntl(
      <MonthGrid
        month={month}
        items={[makeItem({ status: "completed", editable: false })]}
        weekStartsOn={1}
        onSelect={vi.fn()}
        onMove={vi.fn()}
        onCompose={vi.fn()}
      />,
    );
    const chip = screen.getByRole("button", {
      name: /Behind the scenes from the workshop/,
    });
    // A chip that follows the cursor and then snaps back tells the user the
    // calendar can move a post it cannot move.
    expect(chip).toHaveAttribute("draggable", "false");
  });
});

describe("queue", () => {
  it("shows the platform's own failure text without opening the post", () => {
    renderWithIntl(
      <QueueList
        items={[
          makeItem({
            status: "failed",
            lastError:
              "instagram denied publish the video. Your access token may be revoked.",
          }),
        ]}
        total={1}
        active="all"
        onFilter={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/Your access token may be revoked/),
    ).toBeInTheDocument();
  });
});

describe("post detail", () => {
  it("offers publish now and a new time only while the post is still editable", () => {
    renderWithIntl(
      <PostDetail
        item={makeItem()}
        onClose={vi.fn()}
        onReschedule={vi.fn()}
        onCancel={vi.fn()}
        onDuplicate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Publish now" })).toBeEnabled();
    expect(screen.getByLabelText("Move to")).toBeInTheDocument();
  });

  it("hides the timing controls once a post has published", () => {
    renderWithIntl(
      <PostDetail
        item={makeItem({ status: "completed", editable: false })}
        onClose={vi.fn()}
        onReschedule={vi.fn()}
        onCancel={vi.fn()}
        onDuplicate={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Publish now" }),
    ).not.toBeInTheDocument();
    // Cancel is gone too: cancelling here would delete nothing on the platform
    // while telling the user it had.
    expect(
      screen.queryByRole("button", { name: "Cancel" }),
    ).not.toBeInTheDocument();
  });

  it("refuses to cancel a post that is mid-upload, and says why", () => {
    renderWithIntl(
      <PostDetail
        item={makeItem({ status: "processing", editable: false, progress: 40 })}
        onClose={vi.fn()}
        onReschedule={vi.fn()}
        onCancel={vi.fn()}
        onDuplicate={vi.fn()}
      />,
    );
    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel).toBeDisabled();
    expect(cancel).toHaveAttribute(
      "title",
      "This post is uploading and cannot be cancelled.",
    );
  });

  it("marks a natively scheduled post as held by the platform", () => {
    renderWithIntl(
      <PostDetail
        item={makeItem({ platform: "youtube", deliveryMode: "native" })}
        onClose={vi.fn()}
        onReschedule={vi.fn()}
        onCancel={vi.fn()}
        onDuplicate={vi.fn()}
      />,
    );
    // The distinction matters operationally: a natively scheduled post
    // survives a Gaddr outage and a queued one does not.
    expect(screen.getByText(/held by YouTube/i)).toBeInTheDocument();
  });

  it("offers the group switch only when the post went to several channels", () => {
    const { rerender } = renderWithIntl(
      <PostDetail
        item={makeItem()}
        onClose={vi.fn()}
        onReschedule={vi.fn()}
        onCancel={vi.fn()}
        onDuplicate={vi.fn()}
      />,
    );
    expect(
      screen.queryByLabelText(/Apply to every channel/),
    ).not.toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
        <PostDetail
          item={makeItem({ groupId: "group-1" })}
          onClose={vi.fn()}
          onReschedule={vi.fn()}
          onCancel={vi.fn()}
          onDuplicate={vi.fn()}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByLabelText(/Apply to every channel/)).toBeInTheDocument();
  });

  it("sends null rather than a timestamp when publishing now", async () => {
    const user = userEvent.setup();
    const onReschedule = vi.fn();
    renderWithIntl(
      <PostDetail
        item={makeItem()}
        onClose={vi.fn()}
        onReschedule={onReschedule}
        onCancel={vi.fn()}
        onDuplicate={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Publish now" }));
    // The API treats an absent time as an error and null as "now". Sending a
    // timestamp here would schedule the post a moment in the past instead.
    expect(onReschedule).toHaveBeenCalledWith(
      expect.objectContaining({ id: "job-1" }),
      null,
      false,
    );
  });
});
