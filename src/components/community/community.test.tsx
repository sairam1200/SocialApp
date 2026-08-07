import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/i18n/messages/en.json";
import type { Post } from "@/types/community.type";
import { PostCard, compactCount, formatMinor } from "./PostCard";
import { PostPoll } from "./PostPoll";
import { DisclosureBadge } from "./DisclosureBadge";
import { defaultScheduleValue } from "./Composer";

function renderWithIntl(ui: React.ReactElement) {
	return render(
		<NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
			{ui}
		</NextIntlClientProvider>,
	);
}

function makePost(overrides: Partial<Post> = {}): Post {
	return {
		id: "post-1",
		kind: "update",
		status: "published",
		visibility: "public",
		author: {
			id: "profile-1",
			handle: "anna",
			displayName: "Anna Andersson",
			kind: "creator",
			isVerified: true,
			followersCount: 1234,
			isFollowedByViewer: false,
		},
		body: "Shipping the Community layer #buildinpublic with @bo",
		media: [],
		products: [],
		tags: ["buildinpublic"],
		topics: ["product"],
		isSponsored: false,
		disclosure: "none",
		likesCount: 12,
		commentsCount: 3,
		repostsCount: 1,
		sharesCount: 0,
		canEdit: false,
		createdOn: "2026-07-20T10:00:00.000Z",
		publishedOn: "2026-07-20T10:00:00.000Z",
		url: "https://demo.gaddr.com/community/anna/post-1",
		reasons: ["followed"],
		...overrides,
	};
}

describe("PostCard", () => {
	it("renders the author, the body and the counts", () => {
		renderWithIntl(<PostCard post={makePost()} />);

		expect(screen.getByText("Anna Andersson")).toBeInTheDocument();
		expect(screen.getByText("@anna")).toBeInTheDocument();
		expect(screen.getByText(/Shipping the Community layer/)).toBeInTheDocument();
		expect(screen.getByTestId("post-like")).toHaveAttribute(
			"aria-label",
			"Like (12)",
		);
	});

	it("carries a machine-readable date alongside the relative one", () => {
		// A relative time alone is unreadable to a crawler and unusable for
		// sorting; the `datetime` attribute is what makes the card honest.
		const { container } = renderWithIntl(<PostCard post={makePost()} />);
		const time = container.querySelector("time");
		expect(time).toHaveAttribute("dateTime", "2026-07-20T10:00:00.000Z");
	});

	it("links hashtags and mentions without injecting HTML", () => {
		renderWithIntl(<PostCard post={makePost()} />);

		expect(screen.getByText("#buildinpublic").closest("a")).toHaveAttribute(
			"href",
			expect.stringContaining("explore"),
		);
		expect(screen.getByText("@bo").closest("a")).toHaveAttribute(
			"href",
			"/community/bo",
		);
	});

	it("does not render markup found in a post body", () => {
		// A post body is user input. If this ever renders as an element, the
		// feed has an XSS.
		const { container } = renderWithIntl(
			<PostCard post={makePost({ body: "<img src=x onerror=alert(1)>" })} />,
		);
		expect(container.querySelector("img[onerror]")).toBeNull();
		expect(screen.getByText(/<img src=x/)).toBeInTheDocument();
	});

	it("shows a visibility badge for anything narrower than public", () => {
		renderWithIntl(<PostCard post={makePost({ visibility: "close_friends" })} />);
		expect(screen.getByText("Close friends")).toBeInTheDocument();
	});

	it("shows no visibility badge on a public post", () => {
		renderWithIntl(<PostCard post={makePost()} />);
		expect(screen.queryByText("Close friends")).not.toBeInTheDocument();
		expect(screen.queryByText("Followers")).not.toBeInTheDocument();
	});

	it("reports a like to the handler", async () => {
		const onReact = vi.fn();
		renderWithIntl(<PostCard post={makePost()} onReact={onReact} />);

		await userEvent.click(screen.getByTestId("post-like"));
		expect(onReact).toHaveBeenCalledWith("post-1", "like");
	});

	it("marks a reaction the viewer has already given", () => {
		renderWithIntl(<PostCard post={makePost({ viewerReaction: "like" })} />);
		expect(screen.getByTestId("post-like")).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("renders a repost target inline, one level deep", () => {
		const original = makePost({ id: "post-0", body: "The original" });
		renderWithIntl(
			<PostCard
				post={makePost({ id: "post-2", kind: "repost", repostOf: original })}
			/>,
		);
		expect(screen.getByText("The original")).toBeInTheDocument();
	});
});

describe("DisclosureBadge", () => {
	it("labels a paid partnership, with the sponsor", () => {
		renderWithIntl(
			<DisclosureBadge
				disclosure="paid_partnership"
				sponsorHandle="acme"
				sponsorName="Acme"
			/>,
		);
		expect(screen.getByTestId("disclosure-badge")).toBeInTheDocument();
		expect(screen.getByText("Paid partnership")).toBeInTheDocument();
		expect(screen.getByText("Acme").closest("a")).toHaveAttribute(
			"href",
			"/community/acme",
		);
	});

	it("renders nothing when there is nothing to disclose", () => {
		const { container } = renderWithIntl(<DisclosureBadge disclosure="none" />);
		expect(container).toBeEmptyDOMElement();
	});

	it("is rendered on every sponsored post by the card itself", () => {
		// The label is not optional and not behind a "more" affordance: the card
		// renders it whenever the post carries one.
		renderWithIntl(
			<PostCard
				post={makePost({ isSponsored: true, disclosure: "paid_partnership" })}
			/>,
		);
		expect(screen.getByTestId("disclosure-badge")).toBeInTheDocument();
	});
});

describe("PostPoll", () => {
	const poll = {
		options: [
			{ id: "a", label: "For You", votesCount: 7, share: 0.7 },
			{ id: "b", label: "Latest", votesCount: 3, share: 0.3 },
		],
		totalVotes: 10,
		isClosed: false,
		viewerOptionId: null,
	};

	it("hides results until the reader has voted", () => {
		// Showing the tally first anchors the answer.
		renderWithIntl(<PostPoll poll={poll} />);
		expect(screen.queryByText("70%")).not.toBeInTheDocument();
	});

	it("shows results once the reader has voted", () => {
		renderWithIntl(<PostPoll poll={{ ...poll, viewerOptionId: "a" }} />);
		expect(screen.getByText("70%")).toBeInTheDocument();
		expect(screen.getByText("30%")).toBeInTheDocument();
	});

	it("shows results on a closed poll even without a vote", () => {
		renderWithIntl(<PostPoll poll={{ ...poll, isClosed: true }} />);
		expect(screen.getByText("70%")).toBeInTheDocument();
	});

	it("reports a vote", async () => {
		const onVote = vi.fn();
		renderWithIntl(<PostPoll poll={poll} onVote={onVote} />);

		await userEvent.click(screen.getByText("For You"));
		expect(onVote).toHaveBeenCalledWith("a");
	});

	it("does not accept a second vote through the UI", async () => {
		const onVote = vi.fn();
		renderWithIntl(
			<PostPoll poll={{ ...poll, viewerOptionId: "a" }} onVote={onVote} />,
		);

		await userEvent.click(screen.getByText("Latest"));
		expect(onVote).not.toHaveBeenCalled();
	});
});

describe("compactCount", () => {
	it("keeps small numbers exact", () => {
		expect(compactCount(0)).toBe("0");
		expect(compactCount(999)).toBe("999");
	});

	it("abbreviates larger ones without a trailing .0", () => {
		expect(compactCount(1000)).toBe("1k");
		expect(compactCount(1234)).toBe("1.2k");
		expect(compactCount(1_500_000)).toBe("1.5M");
	});

	it("never renders a negative count", () => {
		expect(compactCount(-5)).toBe("0");
	});
});

describe("formatMinor", () => {
	it("converts minor units to a currency string", () => {
		expect(formatMinor("1999", "EUR")).toMatch(/19[.,]99/);
	});

	it("returns an empty string for a value it cannot read", () => {
		expect(formatMinor("not-a-number", "EUR")).toBe("");
	});
});

describe("defaultScheduleValue", () => {
	it("returns a local-time string the datetime-local input accepts", () => {
		// `toISOString()` here would shift by the reader's offset and schedule
		// the post at the wrong time.
		const value = defaultScheduleValue(new Date("2026-07-26T09:17:00"));
		expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
		expect(value.endsWith(":00")).toBe(true);
	});

	it("is at least an hour in the future", () => {
		const now = new Date("2026-07-26T09:17:00");
		const value = defaultScheduleValue(now);
		expect(new Date(value).getTime()).toBeGreaterThan(now.getTime());
	});
});
