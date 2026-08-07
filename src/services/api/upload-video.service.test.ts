import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadVideo } from "./upload-video.service";

class SuccessfulR2Xhr {
	static urls: string[] = [];
	status = 200;
	upload = { addEventListener: (_event: string, callback: (event: ProgressEvent) => void) => { this.progress = callback; } };
	private listeners = new Map<string, () => void>();
	private progress?: (event: ProgressEvent) => void;
	open(_method: string, url: string) { SuccessfulR2Xhr.urls.push(url); }
	addEventListener(event: string, callback: () => void) { this.listeners.set(event, callback); }
	getResponseHeader(name: string) { return name === "ETag" ? '"etag-1"' : null; }
	send(body: Blob) {
		this.progress?.({ loaded: body.size } as ProgressEvent);
		queueMicrotask(() => this.listeners.get("load")?.());
	}
	abort() { this.listeners.get("abort")?.(); }
}

class AbortableR2Xhr extends SuccessfulR2Xhr {
	static instance: AbortableR2Xhr | null = null;
	constructor() {
		super();
		AbortableR2Xhr.instance = this;
	}
	send() {
		// Remain in flight until the AbortSignal reaches xhr.abort().
	}
}

describe("direct R2 video upload transport", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		SuccessfulR2Xhr.urls = [];
		AbortableR2Xhr.instance = null;
	});

	it("sends video bytes to a signed R2 URL and only JSON to the app API", async () => {
		const fetchMock = vi.fn()
			.mockResolvedValueOnce(new Response(JSON.stringify({
				uploadId: "upload-1",
				partSize: 8 * 1024 * 1024,
				totalParts: 1,
				parts: [{ partNumber: 1, url: "https://bucket.r2.cloudflarestorage.com/signed-part" }],
			}), { status: 201, headers: { "Content-Type": "application/json" } }))
			.mockResolvedValueOnce(new Response(JSON.stringify({
				url: "https://media.example/video.mp4",
				transcoded: false,
				uploadId: "upload-1",
				r2Key: "uploads/user/video.mp4",
				fileSize: 3,
			}), { status: 200, headers: { "Content-Type": "application/json" } }));
		vi.stubGlobal("fetch", fetchMock);
		vi.stubGlobal("XMLHttpRequest", SuccessfulR2Xhr);

		const result = await uploadVideo(new File(["abc"], "video.mp4", { type: "video/mp4" }));

		expect(SuccessfulR2Xhr.urls).toEqual(["https://bucket.r2.cloudflarestorage.com/signed-part"]);
		expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/v1/integrations/upload/video/direct/init", expect.objectContaining({ method: "POST" }));
		expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/v1/integrations/upload/video/direct/upload-1/complete", expect.objectContaining({ method: "POST" }));
		expect(result.uploadId).toBe("upload-1");
	});

	it("aborts the active R2 request and tells the backend to cancel the multipart session", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						uploadId: "upload-1",
						partSize: 8 * 1024 * 1024,
						totalParts: 1,
						parts: [{ partNumber: 1, url: "https://bucket.r2.cloudflarestorage.com/signed-part" }],
					}),
					{ status: 201, headers: { "Content-Type": "application/json" } }
				)
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ cancelled: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				})
			);
		vi.stubGlobal("fetch", fetchMock);
		vi.stubGlobal("XMLHttpRequest", AbortableR2Xhr);
		const controller = new AbortController();

		const promise = uploadVideo(
			new File(["abc"], "video.mp4", { type: "video/mp4" }),
			undefined,
			controller.signal
		);
		await vi.waitFor(() => expect(AbortableR2Xhr.instance).not.toBeNull());
		controller.abort();

		await expect(promise).rejects.toMatchObject({ name: "AbortError" });
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			"/api/v1/integrations/upload/video/direct/upload-1",
			expect.objectContaining({ method: "DELETE" })
		);
	});
});
