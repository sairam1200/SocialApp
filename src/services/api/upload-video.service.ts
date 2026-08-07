export interface UploadVideoResult {
	url: string;
	transcoded: boolean;
	uploadId: string;
	r2Key: string;
	fileSize: number;
}

interface SignedPart {
	partNumber: number;
	url: string;
}

interface InitiatedUpload {
	uploadId: string;
	partSize: number;
	totalParts: number;
	parts: SignedPart[];
}

interface CompletedPart {
	partNumber: number;
	etag: string;
}

class PartUploadError extends Error {
	constructor(public readonly status: number) {
		super(`R2 part upload failed (${status})`);
	}
}

class MissingEtagError extends Error {}

type ApiEnvelope<T> = T | { data: T };

const API_BASE = "/api/v1/integrations/upload/video/direct";
const PART_CONCURRENCY = 3;

function unwrap<T>(value: ApiEnvelope<T>): T {
	return typeof value === "object" && value !== null && "data" in value ? value.data : value;
}

async function readJson<T>(response: Response): Promise<T> {
	if (!response.ok) {
		let message = `Upload request failed (${response.status})`;
		try {
			const problem = (await response.json()) as { detail?: string; message?: string; originalMessage?: string };
			message = problem.detail || problem.originalMessage || problem.message || message;
		} catch {
			// The HTTP status remains a useful fallback when the response is not JSON.
		}
		throw new Error(message);
	}
	return unwrap((await response.json()) as ApiEnvelope<T>);
}

async function controlRequest<T>(base: string, path: string, init: RequestInit): Promise<T> {
	const response = await fetch(`${base}${path}`, {
		...init,
		credentials: "include",
		headers: { "Content-Type": "application/json", ...init.headers },
	});
	return readJson<T>(response);
}

function uploadPart(
	part: SignedPart,
	body: Blob,
	signal: AbortSignal | undefined,
	onLoaded: (loaded: number) => void
): Promise<CompletedPart> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		const abort = () => xhr.abort();
		xhr.upload.addEventListener("progress", (event) => onLoaded(event.loaded));
		xhr.addEventListener("load", () => {
			signal?.removeEventListener("abort", abort);
			if (xhr.status < 200 || xhr.status >= 300) {
				reject(new PartUploadError(xhr.status));
				return;
			}
			const etag = xhr.getResponseHeader("ETag");
			if (!etag) {
				reject(new MissingEtagError("R2 did not expose the ETag response header. Check bucket CORS."));
				return;
			}
			onLoaded(body.size);
			resolve({ partNumber: part.partNumber, etag });
		});
		xhr.addEventListener(
			"error",
			() =>
				reject(
					new Error(
						"Network/CORS error while uploading to R2. Check that the R2 bucket allows this frontend origin and exposes the ETag header.",
					),
				),
		);
		xhr.addEventListener("abort", () => {
			const error = new DOMException("Upload cancelled", "AbortError");
			reject(error);
		});
		if (signal?.aborted) {
			reject(new DOMException("Upload cancelled", "AbortError"));
			return;
		}
		signal?.addEventListener("abort", abort, { once: true });
		xhr.open("PUT", part.url);
		xhr.send(body);
	});
}

function retryDelay(milliseconds: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		const timeout = window.setTimeout(resolve, milliseconds);
		signal?.addEventListener(
			"abort",
			() => {
				window.clearTimeout(timeout);
				reject(new DOMException("Upload cancelled", "AbortError"));
			},
			{ once: true }
		);
	});
}

export async function cancelVideoUpload(uploadId: string, base = API_BASE): Promise<void> {
	await controlRequest<{ cancelled: true }>(base, `/${encodeURIComponent(uploadId)}`, { method: "DELETE" });
}

async function uploadMultipart(
	file: File,
	onProgress?: (percent: number) => void,
	signal?: AbortSignal,
	base = API_BASE,
): Promise<UploadVideoResult> {
	const initiated = await controlRequest<InitiatedUpload>(base, "/init", {
		method: "POST",
		body: JSON.stringify({ fileName: file.name, fileSize: file.size, contentType: file.type || "video/mp4" }),
		signal,
	});
	const loadedByPart = new Map<number, number>();
	const completed: CompletedPart[] = [];
	let cursor = 0;

	const updateProgress = (partNumber: number, loaded: number) => {
		loadedByPart.set(partNumber, loaded);
		const totalLoaded = Array.from(loadedByPart.values()).reduce((sum, value) => sum + value, 0);
		onProgress?.(Math.min(99, Math.round((totalLoaded / file.size) * 100)));
	};

	try {
		const workers = Array.from({ length: Math.min(PART_CONCURRENCY, initiated.totalParts) }, async () => {
			while (cursor < initiated.parts.length) {
				const index = cursor++;
				let part = initiated.parts[index];
				const start = (part.partNumber - 1) * initiated.partSize;
				const body = file.slice(start, Math.min(start + initiated.partSize, file.size));
				for (let attempt = 0; attempt < 3; attempt += 1) {
					try {
						completed.push(
							await uploadPart(part, body, signal, (loaded) => updateProgress(part.partNumber, loaded))
						);
						break;
					} catch (error) {
						if ((error as Error).name === "AbortError" || error instanceof MissingEtagError) throw error;
						if (attempt === 2) throw error;
						if (error instanceof PartUploadError && error.status === 403) {
							const refreshed = await controlRequest<{ parts: SignedPart[] }>(base,
								`/${encodeURIComponent(initiated.uploadId)}/parts`,
								{ method: "POST", body: JSON.stringify({ partNumbers: [part.partNumber] }), signal }
							);
							part = refreshed.parts[0];
						}
						await retryDelay(400 * 2 ** attempt, signal);
					}
				}
			}
		});
		await Promise.all(workers);
		completed.sort((a, b) => a.partNumber - b.partNumber);
		const result = await controlRequest<UploadVideoResult>(base, `/${encodeURIComponent(initiated.uploadId)}/complete`, {
			method: "POST",
			body: JSON.stringify({ parts: completed }),
			signal,
		});
		onProgress?.(100);
		return result;
	} catch (error) {
		await cancelVideoUpload(initiated.uploadId, base).catch(() => undefined);
		throw error;
	}
}

export async function uploadVideo(
	file: File,
	onProgress?: (percent: number) => void,
	signal?: AbortSignal,
): Promise<UploadVideoResult> {
	return uploadMultipart(file, onProgress, signal);
}

/** Multipart/ETag upload for images larger than the direct-upload limit. */
export async function uploadLargeImage(
	file: File,
	onProgress?: (percent: number) => void,
	signal?: AbortSignal,
): Promise<UploadVideoResult> {
	return uploadMultipart(file, onProgress, signal);
}
