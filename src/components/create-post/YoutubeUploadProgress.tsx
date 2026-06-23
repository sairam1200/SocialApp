import { useEffect, useRef, useState } from "react";
import { YoutubeUploadProgressEvent } from "@/types/social/youtube.type";

type Props = {
  jobId: string;
  onComplete: (event: YoutubeUploadProgressEvent) => void;
  onError: (error: string) => void;
};

const STATUS_MESSAGES: Record<string, string> = {
  pending: "Preparing upload...",
  processing: "Processing video...",
  completed: "Upload complete",
  failed: "Upload failed",
};

export default function YoutubeUploadProgress({ jobId, onComplete, onError }: Props) {
  const [event, setEvent] = useState<YoutubeUploadProgressEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
    const source = new EventSource(`${baseUrl}/integrations/youtube/upload/progress/${jobId}`);
    sourceRef.current = source;

    source.onopen = () => setConnected(true);

    source.onmessage = (msg) => {
      try {
        const data: YoutubeUploadProgressEvent = JSON.parse(msg.data);
        setEvent(data);

        if (data.status === "completed") {
          source.close();
          onComplete(data);
        } else if (data.status === "failed") {
          source.close();
          onError(data.error || "Upload failed");
        }
      } catch {
        // ignore parse errors
      }
    };

    source.onerror = () => {
      source.close();
      onError("Connection lost. Please check the upload status manually.");
    };

    return () => {
      source.close();
    };
  }, [jobId, onComplete, onError]);

  if (!event) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {connected ? "Connecting..." : "Initializing upload..."}
        </p>
        {connected && (
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "5%" }} />
          </div>
        )}
      </div>
    );
  }

  const isFailed = event.status === "failed";
  const isComplete = event.status === "completed";
  const displayMessage = event.statusMessage || STATUS_MESSAGES[event.status] || event.status;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className={isFailed ? "text-destructive" : isComplete ? "text-green-600" : "text-foreground"}>
          {isComplete ? "✅ " : isFailed ? "❌ " : ""}
          {displayMessage}
        </span>
        <span className="text-muted-foreground tabular-nums">{event.progress}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFailed ? "bg-destructive" : isComplete ? "bg-green-500" : "bg-primary"
          }`}
          style={{ width: `${event.progress}%` }}
        />
      </div>
      {isFailed && event.error && (
        <p className="text-xs text-destructive">{event.error}</p>
      )}
    </div>
  );
}
