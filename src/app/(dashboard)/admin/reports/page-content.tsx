"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import type { AdminReport } from "@/services/api/admin.service";

export default function AdminReportsContent() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchReports = async (status?: string) => {
    setLoading(true);
    try {
      const result = await apiClient.Admin.getReports(status || undefined, 50);
      setReports(result ?? []);
    } catch {
      // silent
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports(statusFilter || undefined);
  }, [statusFilter]);

  const handleResolve = async (reportId: string, status: string) => {
    const resolution = prompt("Resolution note (optional):");
    await apiClient.Admin.resolveReport({ reportId, status, resolution: resolution ?? undefined });
    fetchReports(statusFilter || undefined);
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and resolve content reports.</p>
      </div>

      <div className="flex gap-2">
        {["", "open", "reviewing", "actioned", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-muted"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No reports found.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">{r.id.slice(0, 8)}</span>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm">
                <span className="font-medium">{r.subjectKind}</span> reported for{" "}
                <span className="font-medium">{r.reason}</span>
              </p>
              {r.detail && <p className="text-sm text-muted-foreground">{r.detail}</p>}
              {r.status === "open" && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleResolve(r.id, "actioned")}
                    className="text-xs rounded-lg bg-primary px-3 py-1 text-primary-foreground hover:opacity-90"
                  >
                    Action
                  </button>
                  <button
                    onClick={() => handleResolve(r.id, "dismissed")}
                    className="text-xs rounded-lg border border-border px-3 py-1 hover:bg-muted"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-800",
    reviewing: "bg-blue-100 text-blue-800",
    actioned: "bg-green-100 text-green-800",
    dismissed: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? colors.open}`}>
      {status}
    </span>
  );
}
