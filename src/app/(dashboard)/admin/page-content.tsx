"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { apiClient } from "@/services/apiClient.service";
import type { AdminStats } from "@/services/api/admin.service";

export default function AdminDashboardContent() {
  const evaluationT = useTranslations("evaluationDashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.Admin.getStats()
      .then(setStats)
      .catch(() => setError("Failed to load stats"));
  }, []);

  return (
    <div className="space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview and management.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={stats?.totalUsers} />
        <StatCard label="Active Users" value={stats?.activeUsers} />
        <StatCard label="Open Reports" value={stats?.openReports} />
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin/users"
          className="rounded-xl border border-border px-6 py-4 font-medium hover:bg-muted transition-colors"
        >
          Manage Users
        </Link>
        <Link
          href="/admin/reports"
          className="rounded-xl border border-border px-6 py-4 font-medium hover:bg-muted transition-colors"
        >
          Review Reports
        </Link>
        <Link
          href="/admin/evaluation"
          className="rounded-xl border border-primary/30 bg-primary/5 px-6 py-4 font-medium text-primary transition-colors hover:bg-primary/10"
        >
          {evaluationT("openCenter")}
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-xl border border-border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value ?? "\u2014"}</p>
    </div>
  );
}
