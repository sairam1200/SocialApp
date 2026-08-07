import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/i18n/messages/en.json";
import type { SearchResultItem } from "@/types/unified-search.type";
// `vi.mock` is hoisted above imports, so a static import here still sees the mocks.
import { UnifiedResults } from "./UnifiedResults";

const replace = vi.fn();
let params = new URLSearchParams();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace }),
	useSearchParams: () => params,
}));

const state = vi.hoisted(() => ({
	items: [] as SearchResultItem[],
	sources: [] as Array<{
		platform: string;
		label: string;
		isNative: boolean;
		count: number;
	}>,
	kinds: [] as Array<{ kind: string; count: number }>,
	topics: [] as Array<{ topic: string; count: number }>,
	lastOptions: undefined as Record<string, unknown> | undefined,
}));

vi.mock("@/hooks/useUnifiedSearch", () => ({
	useUnifiedSearch: (options: Record<string, unknown>) => {
		state.lastOptions = options;
		return {
			items: state.items,
			sources: state.sources,
			kinds: state.kinds,
			topics: state.topics,
			total: state.items.length,
			isLoading: false,
			isError: false,
			hasNextPage: false,
			isFetchingNextPage: false,
			fetchNextPage: vi.fn(),
			refetch: vi.fn(),
		};
	},
}));


function renderResults() {
	return render(
		<NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
			<UnifiedResults keyword="design" basePath="/discover" />
		</NextIntlClientProvider>,
	);
}

function item(overrides: Partial<SearchResultItem> = {}): SearchResultItem {
	return {
		id: "gaddr:post:1",
		kind: "post",
		source: {
			platform: "gaddr",
			isNative: true,
			label: "Gaddr",
			externalUrl: null,
		},
		title: "A post on Gaddr",
		url: "/community/anna/1",
		topics: [],
		score: 1,
		reasons: [],
		...overrides,
	};
}

beforeEach(() => {
	replace.mockClear();
	params = new URLSearchParams();
	state.items = [item()];
	state.sources = [
		{ platform: "gaddr", label: "Gaddr", isNative: true, count: 1 },
		{ platform: "youtube", label: "YouTube", isNative: false, count: 3 },
	];
	state.kinds = [
		{ kind: "post", count: 1 },
		{ kind: "video", count: 3 },
	];
	state.topics = [
		{ topic: "design", count: 4 },
		{ topic: "fitness", count: 1 },
	];
});

describe("UnifiedResults", () => {
	it("offers all four ways to order the same list", () => {
		renderResults();
		for (const mode of ["all", "for-you", "latest", "random"]) {
			expect(screen.getByTestId(`search-mode-${mode}`)).toBeInTheDocument();
		}
		expect(screen.getByTestId("search-mode-all")).toHaveAttribute(
			"aria-selected",
			"true",
		);
	});

	it("puts the mode in the URL, and leaves the default out of it", async () => {
		renderResults();
		await userEvent.click(screen.getByTestId("search-mode-latest"));
		expect(replace).toHaveBeenCalledWith(
			"/discover?mode=latest",
			expect.anything(),
		);
	});

	it("shows the themes actually present in the results", () => {
		renderResults();
		expect(screen.getByTestId("filter-topic-design")).toHaveTextContent(
			"#design",
		);
		expect(screen.getByTestId("filter-topic-fitness")).toBeInTheDocument();
	});

	it("adds a theme to the URL rather than replacing the others", async () => {
		params = new URLSearchParams("topics=design");
		renderResults();
		await userEvent.click(screen.getByTestId("filter-topic-fitness"));
		expect(replace).toHaveBeenCalledWith(
			"/discover?topics=design%2Cfitness",
			expect.anything(),
		);
	});

	it("removes a theme that was already chosen", async () => {
		params = new URLSearchParams("topics=design");
		renderResults();
		await userEvent.click(screen.getByTestId("filter-topic-design"));
		expect(replace).toHaveBeenCalledWith("/discover", expect.anything());
	});

	it("passes every filter down to the query", () => {
		params = new URLSearchParams(
			"mode=for-you&platforms=gaddr&kinds=video&topics=design",
		);
		renderResults();
		expect(state.lastOptions).toMatchObject({
			keyword: "design",
			mode: "for-you",
			platforms: ["gaddr"],
			kinds: ["video"],
			topics: ["design"],
		});
	});

	it("clears every filter at once, but keeps the ordering", async () => {
		// Mode is not a filter. Resetting it along with them reads as a bug to
		// anyone who deliberately chose chronological.
		params = new URLSearchParams(
			"mode=latest&platforms=gaddr&kinds=video&topics=design",
		);
		renderResults();

		expect(screen.getByTestId("clear-filters")).toHaveTextContent(
			"Clear 3 filters",
		);
		await userEvent.click(screen.getByTestId("clear-filters"));
		expect(replace).toHaveBeenCalledWith(
			"/discover?mode=latest",
			expect.anything(),
		);
	});

	it("offers nothing to clear when nothing is filtered", () => {
		renderResults();
		expect(screen.queryByTestId("clear-filters")).not.toBeInTheDocument();
	});

	it("provides extra top-right action space for external result cards", () => {
		state.items = [
			item({
				url: "https://youtube.com/watch?v=1",
				source: {
					platform: "youtube",
					isNative: false,
					label: "YouTube",
					externalUrl: "https://youtube.com/watch?v=1",
				},
			}),
		];

		renderResults();

		const result = screen.getByTestId("search-result-card");
		expect(result).toHaveAttribute("data-external-result", "true");
		expect(result.style.getPropertyValue("--content-card-action-offset")).toBe(
			"1.75rem",
		);
	});

	it("renders the Gaddr view count supplied by the result response", () => {
		state.items = [
			item({
				contentStreamId: "8d8a0f03-e46c-45aa-9be4-3f31aa2f859e",
				metrics: { gaddrViews: "1234" },
			}),
		];

		renderResults();

		expect(screen.getByTestId("result-view-count")).toHaveTextContent(
			"1,234 Gaddr views",
		);
	});
});
