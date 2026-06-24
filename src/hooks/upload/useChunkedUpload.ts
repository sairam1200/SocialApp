import { useState, useCallback, useRef } from "react";

const CHUNK_SIZE = 1024 * 1024;

export interface ChunkedUploadResult {
  videoId: string;
  jobId: string;
  status: string;
  publishAt?: string;
}

export interface ChunkedUploadState {
  progress: number;
  phase: "idle" | "initializing" | "uploading" | "finalizing" | "complete" | "error";
  error?: string;
}

export interface ChunkUploadMetadata {
  accountId: string;
  title: string;
  description?: string;
  tags?: string[];
  visibility?: string;
  publishAt?: string;
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function useChunkedUpload() {
  const [state, setState] = useState<ChunkedUploadState>({
    progress: 0,
    phase: "idle",
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (
      file: File,
      metadata: ChunkUploadMetadata,
    ): Promise<ChunkedUploadResult> => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      setState({ progress: 0, phase: "initializing" });

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const baseUrl = getApiBaseUrl();
      const authHeaders = await getAuthHeaders();

      // 1. Init upload session
      let uploadId: string;
      try {
        const initRes = await fetch(`${baseUrl}/integrations/youtube/upload/init`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            accountId: metadata.accountId,
            title: metadata.title,
            description: metadata.description || "",
            tags: metadata.tags || [],
            visibility: metadata.visibility || "public",
            publishAt: metadata.publishAt || undefined,
            totalSize: file.size,
            fileName: file.name,
            totalChunks,
          }),
          signal,
        });

        if (!initRes.ok) {
          const errBody = await initRes.text();
          throw new Error(`Init failed (${initRes.status}): ${errBody}`);
        }

        const initData = await initRes.json();
        uploadId = initData.uploadId;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error("Upload aborted");
        }
        const message = err instanceof Error ? err.message : "Upload initialization failed";
        setState({ progress: 0, phase: "error", error: message });
        throw err;
      }

      // 2. Upload chunks
      setState({ progress: 0, phase: "uploading" });

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end);
        const chunkFile = new File([chunkBlob], `chunk-${i}`, { type: "application/octet-stream" });

        const formData = new FormData();
        formData.append("chunk", chunkFile);

        try {
          const chunkRes = await fetch(
            `${baseUrl}/integrations/youtube/upload/chunk/${uploadId}`,
            {
              method: "POST",
              headers: {
                "x-chunk-index": String(i),
                "x-total-chunks": String(totalChunks),
                ...authHeaders,
              },
              body: formData,
              signal,
            },
          );

          if (!chunkRes.ok) {
            const errBody = await chunkRes.text();
            throw new Error(`Chunk ${i} failed (${chunkRes.status}): ${errBody}`);
          }

          const chunkData = await chunkRes.json();
          setState((prev) => ({
            ...prev,
            progress: chunkData.progress ?? Math.round(((i + 1) / totalChunks) * 100),
          }));

          // If the response includes videoId, the upload is complete
          if (chunkData.complete && chunkData.videoId) {
            setState({ progress: 100, phase: "complete" });
            return {
              videoId: chunkData.videoId,
              jobId: chunkData.jobId,
              status: chunkData.status,
              publishAt: chunkData.publishAt,
            };
          }
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === "AbortError") {
            break;
          }
          const message = err instanceof Error ? err.message : "Chunk upload failed";
          setState((prev) => ({
            ...prev,
            phase: "error",
            error: message,
          }));
          throw err;
        }
      }

      // Check if upload was aborted
      if (signal.aborted) {
        try {
          await fetch(`${baseUrl}/integrations/youtube/upload/abort/${uploadId}`, {
            method: "POST",
            headers: authHeaders,
          });
        } catch {}
        throw new Error("Upload aborted");
      }

      // 3. Finalize (if not already auto-completed)
      setState((prev) => ({ ...prev, phase: "finalizing" }));
      try {
        const completeRes = await fetch(
          `${baseUrl}/integrations/youtube/upload/complete/${uploadId}`,
          {
            method: "POST",
            headers: authHeaders,
            signal,
          },
        );

        if (!completeRes.ok) {
          const errBody = await completeRes.text();
          throw new Error(`Finalize failed (${completeRes.status}): ${errBody}`);
        }

        const result = await completeRes.json();
        setState({ progress: 100, phase: "complete" });
        return {
          videoId: result.videoId,
          jobId: result.jobId,
          status: result.status,
          publishAt: result.publishAt,
        };
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error("Upload aborted");
        }
        const message = err instanceof Error ? err.message : "Upload finalization failed";
        setState({ progress: 0, phase: "error", error: message });
        throw err;
      }
    },
    [],
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current = null;
    setState({ progress: 0, phase: "idle" });
  }, []);

  return { upload, abort, reset, state };
}
