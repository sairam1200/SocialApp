"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/services/apiClient.service";
import toast from "react-hot-toast";

type ExportState = "idle" | "loading" | "done";

export default function DataExportPage() {
  const [state, setState] = useState<ExportState>("idle");
  const [exportData, setExportData] = useState<string | null>(null);

  const handleExport = async () => {
    setState("loading");
    try {
      const response = await apiClient.Account.exportData();
      const json = JSON.stringify(response.data ?? response, null, 2);
      setExportData(json);
      setState("done");
      toast.success("Data export ready");
    } catch {
      setState("idle");
      toast.error("Export failed. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!exportData) return;
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gaddr-me-search-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Data Export</h2>
        <p className="text-sm text-gray-neutral">
          Request a copy of all data associated with your account.
        </p>
      </div>

      <section className="space-y-4">
        <div className="rounded-xl border border-border p-4">
          <p className="font-medium mb-1">Export your data</p>
          <p className="text-sm text-muted-foreground mb-4">
            This will include your profile, connections, and account settings.
            The export will be available as a JSON file.
          </p>

          {state === "idle" && (
            <Button label="Request data export" onClick={handleExport} />
          )}

          {state === "loading" && (
            <Button label="Preparing export..." loading disabled />
          )}

          {state === "done" && (
            <Button label="Download export" onClick={handleDownload} />
          )}
        </div>
      </section>
    </div>
  );
}
