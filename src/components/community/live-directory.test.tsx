import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/i18n/messages/en.json";
import type { LiveCategory, StreamSummary } from "@/types/community.type";
// `vi.mock` is hoisted above imports, so a static import here still sees the mocks.
import { LiveDirectory } from "./LiveDirectory";

const replace = vi.fn();
let params = new URLSearchParams();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace }),
	useSearchParams: () => params,
}));

const streams = vi.hoisted(() => ({ value: [] as StreamSummary[] }));
const categories = vi.hoisted(() => ({ value: [] as LiveCategory[] }));
const lastQuery = vi.hoisted(() => ({
	value: undefined as { category?: string; sort?: string } | undefined,
}));

vi.mock("@/hooks/useCommunity", () => ({
	useLiveStreams: (options?: { category?: string; sort?: string }) => {
		lastQuery.value = options;
		return { data: streams.value, isLoading: false };
	},
	useLiveCategories: () => ({ data: categories.value }),
	communityKeys: {},
}));


function renderDirectory() {
	return render(
		<NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
			<LiveDirectory />
		</NextIntlClientProvider>,
	);
}

function makeStream(overrides: Partial<StreamSummary> = {}): StreamSummary {
	return {
		id: "s1",
		channelKey: "anna",
		status: "live",
		title: "Building in public",
		category: "Design",
		owner: {
			id: "p1",
			handle: "anna",
			displayName: "Anna Andersson",
			kind: "creator",
			isVerified: true,
			followersCount: 10,
			isFollowedByViewer: false,
		},
		viewersCount: 42,
		playback: { hlsUrl: "", llHlsUrl: "", whepUrl: "" },
		chatEnabled: true,
		...overrides,
	};
}

beforeEach(() => {
	replace.mockClear();
	params = new URLSearchParams();
	streams.value = [makeStream()];
	categories.value = [
		{ category: "Design", count: 2, viewers: 300 },
		{ category: "Music", count: 1, viewers: 12 },
	];
});

describe("LiveDirectory", () => {
	it("lists who is live", () => {
		renderDirectory();
		expect(screen.getByText("Building in public")).toBeInTheDocument();
	});

	it("offers both orderings, not only the busiest", () => {
		// Most-watched alone is the ordering in which a new channel is never
		// found. Just-started is the one that makes discovery two-way.
		renderDirectory();
		expect(screen.getByTestId("live-sort-viewers")).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.getByTestId("live-sort-recent")).toBeInTheDocument();
	});

	it("puts the chosen ordering in the URL", async () => {
		renderDirectory();
		await userEvent.click(screen.getByTestId("live-sort-recent"));
		expect(replace).toHaveBeenCalledWith(
			"/community/live?sort=recent",
			expect.anything(),
		);
	});

	it("drops the parameter again for the default ordering", async () => {
		params = new URLSearchParams("sort=recent");
		renderDirectory();
		await userEvent.click(screen.getByTestId("live-sort-viewers"));
		expect(replace).toHaveBeenCalledWith("/community/live", expect.anything());
	});

	it("keeps every category reachable once one is picked", async () => {
		// The rail is fetched independently of the listing precisely so that
		// filtering to Design does not hide Music.
		params = new URLSearchParams("category=Design");
		renderDirectory();

		expect(screen.getByTestId("live-category-Music")).toBeInTheDocument();
		expect(screen.getByTestId("live-category-Design")).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("passes the category and ordering to the query", () => {
		params = new URLSearchParams("category=Music&sort=recent");
		renderDirectory();
		expect(lastQuery.value).toEqual({ category: "Music", sort: "recent" });
	});

	it("says which category is empty, and offers the way out", async () => {
		params = new URLSearchParams("category=Music");
		streams.value = [];
		renderDirectory();

		expect(screen.getByText(/Nobody is live in Music/)).toBeInTheDocument();
		await userEvent.click(
			screen.getAllByText("All categories")[1] ?? screen.getByText("All categories"),
		);
		expect(replace).toHaveBeenCalledWith("/community/live", expect.anything());
	});
});
