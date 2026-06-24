import { useEffect } from "react";
import { YoutubeVideoStatusResponse } from "@/types/social/youtube.type";
import { useUploadStatus } from "@/hooks/api/useYoutube";

type Props = {
  videoId: string;
  onComplete: (status: YoutubeVideoStatusResponse) => void;
  onError: (error: string) => void;
};

const STATUS_MESSAGES: Record<string, string> = {
  pending: "Queued...",
  uploading: "Uploading to YouTube...",
  processing: "Processing...",
  completed: "Upload complete",
  published: "Published",
  scheduled: "Scheduled",
  failed: "Upload failed",
};

export default function YoutubeUploadProgress({ videoId, onComplete, onError }: Props) {
  const { data: status } = useUploadStatus(videoId);

  useEffect(() => {
    if (!status) return;
    if (status.status === "completed" || status.status === "published" || status.status === "scheduled") {
      onComplete(status);
    } else if (status.status === "failed") {
      onError(status.uploadError || "Upload failed");
    }
  }, [status, onComplete, onError]);

  if (!status) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Checking upload status...</p>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "0%" }} />
        </div>
      </div>
    );
  }

  const isFailed = status.status === "failed";
  const isComplete = status.status === "completed" || status.status === "published" || status.status === "scheduled";
  const displayMessage = status.statusMessage || STATUS_MESSAGES[status.status] || status.status;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className={isFailed ? "text-destructive" : isComplete ? "text-green-600" : "text-foreground"}>
          {isComplete ? "✅ " : isFailed ? "❌ " : ""}
          {displayMessage}
        </span>
        <span className="text-muted-foreground tabular-nums">{status.progress}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFailed ? "bg-destructive" : isComplete ? "bg-green-500" : "bg-primary"
          }`}
         // style={{ width: `${status.progress}%` }}
        />
      </div>
      {isFailed && status.uploadError && (
        <p className="text-xs text-destructive">{status.uploadError}</p>
      )}
    </div>
  );
}
