export interface UploadVideoResult {
  url: string;
  transcoded: boolean;
  uploadId: string;
  r2Key: string;
  fileSize: number;
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function uploadVideo(file: File, onProgress?: (percent: number) => void, signal?: AbortSignal): Promise<UploadVideoResult> {
  const baseUrl = getApiBaseUrl();
  const authHeaders = await getAuthHeaders();

  const formData = new FormData();
  formData.append("file", file);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid response from server"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.open("POST", `${baseUrl}/integrations/upload/video`);

    for (const [key, value] of Object.entries(authHeaders)) {
      xhr.setRequestHeader(key, value);
    }

    xhr.send(formData);
  });
}
