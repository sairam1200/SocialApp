"use client";

import { useState } from "react";
import { cn } from "@/utils/cn.util";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/services/apiClient.service";
import toast from "react-hot-toast";

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  subjectId: string;
  subjectKind: "post" | "comment" | "user" | "message";
}

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "nudity", label: "Nudity" },
  { value: "violence", label: "Violence" },
  { value: "misinformation", label: "Misinformation" },
  { value: "impersonation", label: "Impersonation" },
  { value: "undisclosed_ad", label: "Undisclosed ad" },
  { value: "other", label: "Other" },
] as const;

export default function ReportDialog({
  open,
  onClose,
  subjectId,
  subjectKind,
}: ReportDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await apiClient.Community.reportContent({
        subjectId,
        subjectKind,
        reason,
        detail: detail || undefined,
      });
      toast.success("Report submitted");
      onClose();
      setReason("");
      setDetail("");
    } catch {
      toast.error("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report content</DialogTitle>
          <DialogDescription>
            Select a reason and optionally describe the issue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Additional details (optional)"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            maxLength={1000}
          />
        </div>

        <DialogFooter>
          <Button
            label="Cancel"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          />
          <Button
            label="Submit report"
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason || loading}
            loading={loading}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
