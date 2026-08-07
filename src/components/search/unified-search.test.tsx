import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/i18n/messages/en.json";
import type { SearchResultItem } from "@/types/unified-search.type";
import {
	UnifiedResultCard,
	formatDuration,
	formatMoney,
} from "./UnifiedResultCard";
import { SourceBadge } from "./SourceBadge";

function renderWithIntl(ui: React.ReactElement) {
	return render(
		<NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
			{ui}
		</NextIntlClientProvider>,
	);
}

function item(overrides: Partial<SearchResultItem> = {}): SearchResultItem {
	return {
		id: "gaddr:post:1",
		kind: "post",
		source: { platform: "gaddr", isNative: true, label: "Gaddr", externalUrl: null },
		title: "A post on Gaddr",
		description: "Some description",
		url: "/community/anna/1",
		publishedOn: "2026-07-20T10:00:00.000Z",
		topics: [],
		score: 1,
		reasons: [],
		...overrides,
	};
}

describe("SourceBadge", () => {
	it("marks our own content as native, with the label", () => {
		renderWithIntl(
			<SourceBadge
				source={{ platform: "gaddr", isNative: true, label: "Gaddr" }}
			/>,
		);
		const badge = screen.getByTestId("source-badge");
		expect(badge).toHaveAttribute("data-native", "true");
		expect(badge).toHaveAttribute("data-platform", "gaddr");
		expect(badge).toHaveTextContent("Gaddr");
	});

	it("marks Gaddr Jobs as ours too", () => {
		renderWithIntl(
			<SourceBadge
				source={{ platform: "gaddr-jobs", isNative: true, label: "Gaddr Jobs" }}
			/>,
		);
		expect(screen.getByTestId("source-badge")).toHaveAttribute(
			"data-native",
			"true",
		);
	});

	it("does not mark another platform as ours", () => {
		renderWithIntl(
			<SourceBadge
				source={{
					platform: "youtube",
					isNative: false,
					label: "YouTube",
					externalUrl: "https://yt.test/1",
				}}
			/>,
		);
		const badge = screen.getByTestId("source-badge");
		expect(badge).toHaveAttribute("data-native", "false");
		expect(badge).toHaveTextContent("YouTube");
	});
});

describe("UnifiedResultCard", () => {
	it("renders one card for a Community post", () => {
		renderWithIntl(<UnifiedResultCard item={item()} />);
		expect(screen.getByTestId("unified-result")).toHaveAttribute(
			"data-platform",
			"gaddr",
		);
		expect(screen.getByText("A post on Gaddr")).toBeInTheDocument();
	});

	it("renders the same card for a Gaddr Jobs project", () => {
		// The whole point of normalising: a job and a post are one component.
		renderWithIntl(
			<UnifiedResultCard
				item={item({
					id: "gaddr-jobs:project:9",
					kind: "project",
					title: "Build a design system",
					source: {
						platform: "gaddr-jobs",
						isNative: true,
						label: "Gaddr Jobs",
						externalUrl: null,
					},
					metrics: { priceMinor: "500000", currency: "EUR" },
				})}
			/>,
		);
		expect(screen.getByTestId("unified-result")).toHaveAttribute(
			"data-kind",
			"project",
		);
		expect(screen.getByText(/5,000|5 000/)).toBeInTheDocument();
	});

	it("offers a route to the source when the content lives elsewhere", () => {
		renderWithIntl(
			<UnifiedResultCard
				item={item({
					source: {
						platform: "youtube",
						isNative: false,
						label: "YouTube",
						externalUrl: "https://yt.test/watch",
					},
					url: "https://yt.test/watch",
				})}
			/>,
		);
		const link = screen.getByTestId("open-on-source");
		expect(link).toHaveAttribute("href", "https://yt.test/watch");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveTextContent(/YouTube/);
	});

	it("keeps that route for a Gaddr Jobs listing hosted on another board", () => {
		// Ours *and* hosted elsewhere is a real combination — the reader still
		// has to be able to reach the actual application.
		renderWithIntl(
			<UnifiedResultCard
				item={item({
					kind: "job",
					source: {
						platform: "gaddr-jobs",
						isNative: true,
						label: "Gaddr Jobs",
						externalUrl: "https://boards.test/jobs/7",
					},
				})}
			/>,
		);
		expect(screen.getByTestId("open-on-source")).toHaveAttribute(
			"href",
			"https://boards.test/jobs/7",
		);
	});

	it("shows no source link for content that lives here", () => {
		renderWithIntl(<UnifiedResultCard item={item()} />);
		expect(screen.queryByTestId("open-on-source")).not.toBeInTheDocument();
	});

	it("does not render executable result or source URLs", () => {
		renderWithIntl(
			<UnifiedResultCard
				item={item({
					url: "javascript:alert(document.domain)",
					source: {
						platform: "youtube",
						isNative: false,
						label: "YouTube",
						externalUrl: "data:text/html,unsafe",
					},
				})}
			/>,
		);

		expect(screen.queryByRole("link", { name: "A post on Gaddr" })).not.toBeInTheDocument();
		expect(screen.queryByTestId("open-on-source")).not.toBeInTheDocument();
	});

	it("offers inline play only when there is something playable", () => {
		renderWithIntl(
			<UnifiedResultCard
				item={item({
					kind: "video",
					playback: { kind: "video", url: "https://cdn.test/a.mp4" },
				})}
			/>,
		);
		expect(screen.getByTestId("play-inline")).toBeInTheDocument();
	});

	it("offers no play button when nothing can be played here", () => {
		// A play button that bounces to another site is worse than none.
		renderWithIntl(<UnifiedResultCard item={item({ playback: null })} />);
		expect(screen.queryByTestId("play-inline")).not.toBeInTheDocument();
	});

	it("mounts a player in place when play is pressed", async () => {
		renderWithIntl(
			<UnifiedResultCard
				item={item({
					kind: "video",
					playback: { kind: "video", url: "https://cdn.test/a.mp4" },
				})}
			/>,
		);
		await userEvent.click(screen.getByTestId("play-inline"));
		expect(screen.getByTestId("inline-player")).toBeInTheDocument();
	});

	it("carries a machine-readable date alongside the relative one", () => {
		const { container } = renderWithIntl(<UnifiedResultCard item={item()} />);
		expect(container.querySelector("time")).toHaveAttribute(
			"dateTime",
			"2026-07-20T10:00:00.000Z",
		);
	});
});

describe("formatDuration", () => {
	it("formats minutes and hours", () => {
		expect(formatDuration(65)).toBe("1:05");
		expect(formatDuration(3725)).toBe("1:02:05");
	});

	it("returns nothing for a value it cannot use", () => {
		expect(formatDuration(Number.NaN)).toBe("");
		expect(formatDuration(-1)).toBe("");
	});
});

describe("formatMoney", () => {
	it("converts minor units for display", () => {
		expect(formatMoney("500000", "EUR")).toMatch(/5[.,\s]?000/);
	});

	it("returns nothing for an unreadable value", () => {
		expect(formatMoney("abc", "EUR")).toBe("");
	});
});
