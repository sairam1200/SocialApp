"use client";

import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, Gauge, ShieldCheck } from "lucide-react";
import { apiClient } from "@/services/apiClient.service";
import type {
  EvaluationMetric,
  EvaluationStatus,
  EvaluationSummary,
} from "@/services/api/admin.service";
import {
  metricDisplayValue,
  statusTone,
  type EvaluationMetricKey,
} from "./evaluation-ui.util";

const METRIC_KEYS: EvaluationMetricKey[] = [
  "precisionAt5",
  "recallAt5",
  "mrr",
  "ndcgAt5",
  "citationCoverage",
  "factuality",
  "safetyPassRate",
  "p95LatencyMs",
];

export default function EvaluationDashboardContent() {
  const t = useTranslations("evaluationDashboard");
  const format = useFormatter();
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient.Admin.getEvaluationSummary()
      .then((result) => {
        if (!cancelled) setSummary(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const latestRun = summary?.latestRun ?? null;
  const gate = latestRun?.releaseGate ?? "not_run";

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin"
            className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t("backToAdmin")}
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div
          className={`inline-flex min-h-11 items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold ${statusTone(gate)}`}
          role="status"
        >
          {gate === "pass" ? (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          ) : (
            <CircleAlert className="size-4" aria-hidden="true" />
          )}
          {t(`statuses.${gate}`)}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          {t("loadError")}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label={t("summary.goldenCases")}
          value={summary ? format.number(summary.datasetCaseCount) : "—"}
          detail={summary?.datasetVersion ?? t("loading")}
        />
        <SummaryCard
          label={t("summary.latestRun")}
          value={latestRun ? format.dateTime(new Date(latestRun.createdAt), { dateStyle: "medium" }) : t("notRun")}
          detail={latestRun?.runId ?? t("summary.noRunDetail")}
        />
        <SummaryCard
          label={t("summary.judge")}
          value={summary?.judge.configured ? summary.judge.provider ?? t("configured") : t("notConfigured")}
          detail={t("summary.judgeDetail")}
        />
        <SummaryCard
          label={t("summary.observedCases")}
          value={latestRun ? format.number(latestRun.observedCaseCount) : "—"}
          detail={t("summary.observedCasesDetail")}
        />
      </div>

      <section aria-labelledby="evaluation-metrics-title" className="space-y-4">
        <div>
          <h2 id="evaluation-metrics-title" className="text-lg font-semibold text-foreground">
            {t("metrics.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("metrics.description")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRIC_KEYS.map((key) => {
            const metric = latestRun?.metrics[key];
            return <MetricCard key={key} metricKey={key} metric={metric} />;
          })}
        </div>
      </section>

      <section aria-labelledby="evaluation-checks-title" className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Gauge className="size-5 text-primary" aria-hidden="true" />
            <div>
              <h2 id="evaluation-checks-title" className="font-semibold text-foreground">
                {t("checks.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("checks.description")}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(summary?.supportedChecks ?? ["retrieval", "grounding", "factuality", "safety", "latency", "regression-gate"]).map((check) => (
              <div key={check} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm text-foreground">{t(`checks.items.${check}`)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">{t("next.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("next.description")}</p>
          <code className="mt-4 block overflow-x-auto rounded-lg bg-muted px-3 py-3 text-xs text-foreground">
            {t("next.endpoint")}
          </code>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 truncate text-xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function MetricCard({ metricKey, metric }: { metricKey: EvaluationMetricKey; metric?: EvaluationMetric }) {
  const t = useTranslations("evaluationDashboard");
  const display = metric ? metricDisplayValue(metricKey, metric) : { value: null, unit: "none" as const };
  const status: EvaluationStatus = metric?.status ?? "not_run";
  const value =
    display.value === null
      ? t("notRun")
      : display.unit === "percent"
        ? t("values.percent", { value: display.value })
        : t("values.milliseconds", { value: display.value });

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t(`metricNames.${metricKey}`)}</p>
        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${statusTone(status)}`}>
          {t(`statuses.${status}`)}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {metric?.sampleSize ? t("sampleSize", { count: metric.sampleSize }) : t("noSample")}
      </p>
    </div>
  );
}
