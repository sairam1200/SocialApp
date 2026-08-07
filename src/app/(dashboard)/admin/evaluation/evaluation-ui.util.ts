import type {
  EvaluationMetric,
  EvaluationStatus,
} from "@/services/api/admin.service";

export type EvaluationMetricKey =
  | "precisionAt5"
  | "recallAt5"
  | "mrr"
  | "ndcgAt5"
  | "citationCoverage"
  | "factuality"
  | "safetyPassRate"
  | "p95LatencyMs";

export function metricDisplayValue(
  key: EvaluationMetricKey,
  metric: EvaluationMetric,
): { value: number | null; unit: "percent" | "milliseconds" | "none" } {
  if (metric.value === null) return { value: null, unit: "none" };
  if (key === "p95LatencyMs") {
    return { value: Math.round(metric.value), unit: "milliseconds" };
  }
  return { value: Math.round(metric.value * 100), unit: "percent" };
}

export function statusTone(status: EvaluationStatus): string {
  switch (status) {
    case "pass":
      return "border-primary/30 bg-primary/10 text-primary";
    case "fail":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

