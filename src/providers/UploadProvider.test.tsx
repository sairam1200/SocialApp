import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { UploadTray } from "@/components/uploads/UploadTray";
import { UploadProvider, useUploads } from "./UploadProvider";

vi.mock("@/services/api/upload-video.service", () => ({
	uploadVideo: vi.fn((_file: File, onProgress: (value: number) => void, signal: AbortSignal) => {
		onProgress(42);
		return new Promise((_resolve, reject) => {
			signal.addEventListener("abort", () => reject(new DOMException("Upload cancelled", "AbortError")), { once: true });
		});
	}),
}));

const messages = {
	uploads: {
		trayLabel: "Video uploads",
		uploading: "Uploading directly to storage… {progress}%",
		completed: "Upload complete",
		cancelled: "Upload cancelled",
		error: "Upload failed",
		errorHint: "Check your connection and try again.",
		cancelAction: "Cancel upload",
		dismissAction: "Dismiss upload",
	},
};

function Page({ name }: { name: string }) {
	const { startUpload } = useUploads();
	return <><p>{name}</p><button type="button" onClick={() => void startUpload("media-1", new File(["video"], "clip.mp4", { type: "video/mp4" })).catch(() => undefined)}>Start</button></>;
}

function App({ page }: { page: string }) {
	return <NextIntlClientProvider locale="en" messages={messages}><UploadProvider><Page name={page} /><UploadTray /></UploadProvider></NextIntlClientProvider>;
}

describe("UploadProvider", () => {
	it("keeps an upload visible across route-content changes and lets the user cancel it", async () => {
		const user = userEvent.setup();
		const view = render(<App page="Create post" />);
		await user.click(screen.getByRole("button", { name: "Start" }));
		expect(await screen.findByText("Uploading directly to storage… 42%")).toBeInTheDocument();

		view.rerender(<App page="Analytics" />);
		expect(screen.getByText("Analytics")).toBeInTheDocument();
		expect(screen.getByText("clip.mp4")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Cancel upload" }));
		expect(await screen.findByText("Upload cancelled")).toBeInTheDocument();
	});
});
